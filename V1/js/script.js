// --- CÓDIGO PARA FORZAR EL INICIO ARRIBA (VERSIÓN CORREGIDA) ---
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Se ejecuta cuando la página termina de cargar
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// --- LÓGICA PRINCIPAL DE LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS ---
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('#menu-btn');
    const cartContainer = document.querySelector('.cart-items-container');
    const cartBtn = document.querySelector('#cart-btn');
    const cartCloseBtn = document.querySelector('#cart-close-btn');

    // --- MANEJO DE LA INTERFAZ (MENÚ Y CARRITO) ---
    if (menuBtn) {
        menuBtn.onclick = () => {
            navbar.classList.toggle('active');
            cartContainer.classList.remove('active');
        };
    }

    if (cartBtn) {
        cartBtn.onclick = () => {
            cartContainer.classList.toggle('active');
            navbar.classList.remove('active');
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

    // --- LÓGICA DEL CARRITO DE COMPRAS ---
    let cart = [];
    const cartItemsEl = document.getElementById('cart-items');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    function updateCartUI() {
        if (!cartItemsEl) return;
        cartItemsEl.innerHTML = '';
        const itemCounts = cart.reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1;
            return acc;
        }, {});
        const uniqueItems = [...new Map(cart.map(item => [item.name, item])).values()];

        if (uniqueItems.length === 0) {
            cartItemsEl.innerHTML = '<p class="cart-empty-msg">Tu carrito está vacío.</p>';
        } else {
            uniqueItems.forEach(item => {
                const quantity = itemCounts[item.name];
                const price = quantity >= 3 ? parseFloat(item.price) - 5 : parseFloat(item.price);
                const cartItemHTML = `
                    <div class="cart-item">
                        <span class="fas fa-times remove-item" data-name="${item.name}"></span>
                        <img src="img/${item.name.toLowerCase().replace(/ /g, '_')}.jpg" alt="${item.name}">
                        <div class="content">
                            <h3>${item.name} (x${quantity})</h3>
                            <div class="price">S/ ${(price * quantity).toFixed(2)}</div>
                        </div>
                    </div>
                `;
                cartItemsEl.innerHTML += cartItemHTML;
            });
        }
        localStorage.setItem('selvaFusionCart', JSON.stringify(cart));
        addRemoveListeners();
    }

    function addRemoveListeners() {
        document.querySelectorAll('.remove-item').forEach(button => {
            button.onclick = (e) => {
                const name = e.target.getAttribute('data-name');

                // --- NUEVA LÓGICA MEJORADA ---
                // Busca el índice del primer producto con ese nombre
                const itemIndex = cart.findIndex(item => item.name === name);

                // Si lo encuentra, elimina solo ese elemento del array
                if (itemIndex > -1) {
                    cart.splice(itemIndex, 1);
                }
                // --------------------------------

                updateCartUI(); // Actualiza la interfaz con el carrito corregido
            };
        });
    }

    if (addToCartButtons.length > 0) {
        cart = JSON.parse(localStorage.getItem('selvaFusionCart')) || [];
        updateCartUI();
        addToCartButtons.forEach(button => {
            button.onclick = (e) => {
                const box = e.target.closest('.box');
                const name = box.getAttribute('data-name');
                const price = box.getAttribute('data-price');
                cart.push({ name, price });
                updateCartUI();
                if (cartContainer) cartContainer.classList.add('active');
                if (navbar) navbar.classList.remove('active');
            };
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega algunos tragos primero.');
                return;
            }
            window.location.href = 'pago.html';
        };
    }

    // --- LÓGICA PARA LA PÁGINA DE PAGO (PAGO.HTML) ---
    const isPaymentPage = document.querySelector('body.payment-page');
    if (isPaymentPage) {
        const cartData = JSON.parse(localStorage.getItem('selvaFusionCart')) || [];
        const summaryContainer = document.getElementById('summary-items');
        const summaryTotalEl = document.getElementById('summary-total');
        const whatsappBtn = document.getElementById('whatsapp-btn');
        let total = 0;
        let whatsappMessage = '¡Hola Selva Fusión! Quisiera confirmar mi pedido:\n\n';

        if (cartData && cartData.length > 0) {
            const itemCounts = cartData.reduce((acc, item) => {
                acc[item.name] = (acc[item.name] || 0) + 1;
                return acc;
            }, {});
            const uniqueItems = [...new Map(cartData.map(item => [item.name, item])).values()];

            uniqueItems.forEach(item => {
                const quantity = itemCounts[item.name];
                const pricePerUnit = quantity >= 3 ? parseFloat(item.price) - 5.00 : parseFloat(item.price);
                const subtotal = quantity * pricePerUnit;
                total += subtotal;

                const summaryItem = document.createElement('div');
                summaryItem.classList.add('summary-item');
                summaryItem.innerHTML = `
                    <span>${quantity} x ${item.name}</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                `;
                summaryContainer.appendChild(summaryItem);
                whatsappMessage += `- ${quantity} x ${item.name} (Subtotal: S/ ${subtotal.toFixed(2)})\n`;
            });

            summaryTotalEl.textContent = `Total: S/ ${total.toFixed(2)}`;
            whatsappMessage += `\n*Total a pagar: S/ ${total.toFixed(2)}*\n\nAdjunto mi comprobante de pago para coordinar la entrega. ¡Gracias!`;

            // ¡OJO! REEMPLAZA ESTE NÚMERO CON EL TUYO
            const phoneNumber = '51987654321';

            whatsappBtn.href = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;
        } else {
            summaryContainer.innerHTML = '<p>No hay productos en tu pedido.</p>';
            summaryTotalEl.textContent = 'Total: S/ 0.00';
            if (whatsappBtn) whatsappBtn.style.display = 'none';
        }
    }
});