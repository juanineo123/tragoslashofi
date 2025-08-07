// --- CÓDIGO PARA FORZAR EL INICIO ARRIBA ---
// Le decimos al navegador que nosotros controlaremos el scroll manualmente
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
// Cuando la página y todos sus recursos (imágenes, etc.) terminen de cargar,
// la movemos a la posición (0, 0).
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});
document.addEventListener('DOMContentLoaded', () => {

    // --- MANEJO DE LA INTERFAZ BÁSICA (MENÚ Y PANEL DEL CARRITO) ---
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('#menu-btn');
    const cartContainer = document.querySelector('.cart-items-container');
    const cartBtn = document.querySelector('#cart-btn');
    const cartCloseBtn = document.querySelector('#cart-close-btn');

    if (menuBtn) {
        menuBtn.onclick = () => {
            navbar.classList.toggle('active');
            if (cartContainer) cartContainer.classList.remove('active');
        };
    }

    if (cartBtn) {
        cartBtn.onclick = () => {
            cartContainer.classList.toggle('active');
            if (navbar) navbar.classList.remove('active');
        };
    }

    if (cartCloseBtn) {
        cartCloseBtn.onclick = () => {
            cartContainer.classList.remove('active');
        };
    }

    window.onscroll = () => {
        if (navbar) navbar.classList.remove('active');
        if (cartContainer) cartContainer.classList.remove('active');
    };

    // --- LÓGICA DEL NUEVO CARRITO DE COMPRAS (PARA INDEX.HTML) ---
    const isIndexPage = document.querySelector('.products');
    if (isIndexPage) {
        let cart = JSON.parse(localStorage.getItem('tragosLaShofiCart')) || [];

        const saveCart = () => {
            localStorage.setItem('tragosLaShofiCart', JSON.stringify(cart));
        };

        const generateItemId = (box) => {
            const name = box.dataset.name;
            const selector = box.querySelector('.size-selector');
            const presentation = selector.options[selector.selectedIndex].text;
            return `${name}-${presentation}`;
        };

        const updateCartUI = () => {
            const cartItemsEl = document.getElementById('cart-items');
            if (!cartItemsEl) return;
            cartItemsEl.innerHTML = '';

            if (cart.length === 0) {
                cartItemsEl.innerHTML = '<p style="text-align: center; font-size: 1.6rem; color: #666;">Tu carrito está vacío.</p>';
            } else {
                cart.forEach(item => {
                    const imageName = item.name.toLowerCase().replace(/ \(.+\)/, '').replace(/\s/g, '_');
                    const itemHtml = `
                <div class="cart-item">
                    <span class="fas fa-times remove-from-cart" data-id="${item.id}"></span>
                    <img src="img/${imageName}.jpg" alt="${item.name}">
                    <div class="content">
                        <h3>${item.id.replace('-', '<br>')}</h3>
                        <div class="price">
                            ${item.quantity} x S/ ${item.price.toFixed(2)} = <strong>S/ ${(item.quantity * item.price).toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            `;
                    cartItemsEl.innerHTML += itemHtml;
                });
            }

            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.onclick = (e) => {
                    const itemId = e.target.dataset.id;

                    // --- INICIO DE LA MEJORA ---
                    // Antes de borrar el producto del carrito, buscamos su información completa.
                    const itemToRemove = cart.find(item => item.id === itemId);
                    if (itemToRemove) {
                        // Usamos el 'nombre base' del producto para encontrar su tarjeta en la página.
                        const productBox = document.querySelector(`.box[data-name="${itemToRemove.name}"]`);
                        if (productBox) {
                            // Si encontramos la tarjeta, reseteamos su selector de tamaño a la primera opción.
                            // La primera opción es "-- Elige un tamaño --".
                            productBox.querySelector('.size-selector').selectedIndex = 0;
                        }
                    }
                    // --- FIN DE LA MEJORA ---

                    // Ahora sí, eliminamos el producto del carrito y actualizamos todo.
                    cart = cart.filter(item => item.id !== itemId);
                    saveCart();
                    updateCartUI();
                    updateAllProductCards();
                };
            });
        };

        const updateProductCard = (box) => {
            const sizeSelector = box.querySelector('.size-selector');
            const quantityInput = box.querySelector('.quantity-input');
            const button = box.querySelector('.add-to-cart');
            const priceDisplay = box.querySelector('.price');

            if (!sizeSelector.value) {
                priceDisplay.textContent = '';
                button.disabled = true;
                button.classList.remove('in-cart');
                button.textContent = 'Elige un tamaño';
                return;
            }

            button.disabled = false;
            const itemId = generateItemId(box);
            const itemInCart = cart.find(item => item.id === itemId);

            if (itemInCart) {
                button.textContent = 'En el Carrito (Quitar)';
                button.classList.add('in-cart');
                quantityInput.value = itemInCart.quantity;
                quantityInput.disabled = true;
            } else {
                button.textContent = 'Agregar al Carrito';
                button.classList.remove('in-cart');
                quantityInput.disabled = false;
            }
        };

        const updateAllProductCards = () => {
            document.querySelectorAll('.products .box').forEach(updateProductCard);
        };

        document.querySelectorAll('.products .box').forEach(box => {
            const sizeSelector = box.querySelector('.size-selector');
            const priceDisplay = box.querySelector('.price');
            const quantityInput = box.querySelector('.quantity-input');

            // Estado inicial de cada tarjeta al cargar
            if (!sizeSelector.value) {
                priceDisplay.textContent = '';
                box.querySelector('.add-to-cart').disabled = true;
                box.querySelector('.add-to-cart').textContent = 'Elige un tamaño';
            }

            sizeSelector.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];

                if (selectedOption.value) {
                    const price = parseFloat(selectedOption.value);
                    priceDisplay.textContent = `S/ ${price.toFixed(2)}`;
                } else {
                    priceDisplay.textContent = '';
                }

                quantityInput.value = 1;
                updateProductCard(box);
            });

            const button = box.querySelector('.add-to-cart');
            button.addEventListener('click', () => {
                const itemId = generateItemId(box);
                const itemInCart = cart.find(item => item.id === itemId);

                if (itemInCart) {
                    // Acción de "Quitar del Carrito"
                    cart = cart.filter(item => item.id !== itemId);

                    // --- INICIO DE LA CORRECCIÓN ---
                    // Después de quitarlo, reiniciamos el selector de esa tarjeta a la posición inicial.
                    box.querySelector('.size-selector').selectedIndex = 0;
                    // --- FIN DE LA CORRECCIÓN ---

                } else {
                    // Acción de "Agregar al Carrito" (esta parte ya estaba bien)
                    const name = box.dataset.name;
                    const price = parseFloat(sizeSelector.value);
                    const quantity = parseInt(quantityInput.value, 10);
                    if (quantity > 0 && price) {
                        cart.push({ id: itemId, name: name, price: price, quantity: quantity });
                    }
                }

                // Actualizamos todo al final
                saveCart();
                updateCartUI();
                updateProductCard(box);
            });
        });

        // --- INICIALIZACIÓN ---
        // Se dibuja el panel del carrito desde la memoria al cargar la página.
        updateCartUI();

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.onclick = (e) => {
                if (cart.length === 0) {
                    e.preventDefault();
                    alert('Tu carrito está vacío. Agrega algunos productos primero.');
                    return;
                }
                window.location.href = 'pago.html';
            };
        }
    }

    const isPaymentPage = document.querySelector('body.payment-page');
    if (isPaymentPage) {
        const cartData = JSON.parse(localStorage.getItem('tragosLaShofiCart')) || [];
        const summaryContainer = document.getElementById('summary-items');
        const summaryTotalEl = document.getElementById('summary-total');
        const whatsappBtn = document.getElementById('whatsapp-btn');
        let total = 0;
        let whatsappMessage = '¡Hola Tragos La Shofi! Quisiera confirmar mi pedido:\n\n';

        if (summaryContainer && cartData.length > 0) {
            cartData.forEach(item => {
                const subtotal = item.quantity * item.price;
                total += subtotal;
                const summaryItem = document.createElement('div');
                summaryItem.classList.add('summary-item');
                summaryItem.innerHTML = `
                    <span>${item.quantity} x ${item.id.replace('-', ' ')}</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                `;
                summaryContainer.appendChild(summaryItem);
                whatsappMessage += `- ${item.quantity} x ${item.id.replace('-', ' ')} (Subtotal: S/ ${subtotal.toFixed(2)})\n`;
            });

            summaryTotalEl.textContent = `Total: S/ ${total.toFixed(2)}`;
            whatsappMessage += `\n*Total a pagar: S/ ${total.toFixed(2)}*\n\nAdjunto mi comprobante de pago para coordinar la entrega. ¡Gracias!`;
            const phoneNumber = '51987654321';
            whatsappBtn.href = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;
        } else if (summaryContainer) {
            summaryContainer.innerHTML = '<p>No hay productos en tu pedido para mostrar.</p>';
            summaryTotalEl.textContent = 'Total: S/ 0.00';
            whatsappBtn.style.display = 'none';
        }
    }
});