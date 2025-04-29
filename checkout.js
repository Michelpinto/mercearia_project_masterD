document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkout-form');
  const completeOrderBtn = document.getElementById('completeOrderBtn');
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  let products = [];
  fetch('/api/get_products.php')
    .then((response) => response.json())
    .then((data) => {
      products = data.map((p) => ({ ...p, id: Number(p.id) }));
    })
    .catch((error) => {
      console.error('Error loading products:', error);
    });

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    completeOrderBtn.disabled = true;
    completeOrderBtn.textContent = 'À processar...';

    const orderPayload = {
      fullName: checkoutForm.fullName.value.trim(),
      dateOfBirth: checkoutForm.dateOfBirth.value,
      address: checkoutForm.address.value.trim(),
      items: cartItems
        .map((item) => {
          const product = products.find((p) => p.id === Number(item.productId));
          if (!product) {
            console.error('Product not found for cart item:', item);
            return null;
          }
          return {
            product_id: product.id,
            product_name: product.name,
            quantity: item.quantity,
            price: product.price,
          };
        })
        .filter((item) => item !== null),
    };

    fetch('/api/complete_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          localStorage.removeItem('cartItems');
          window.location.href = '/order_confirmed.html';
        } else {
          alert('Error: ' + data.error);
          completeOrderBtn.disabled = false;
          completeOrderBtn.textContent = 'Pedido Completo';
        }
      })
      .catch((error) => {
        console.error('Error submitting order:', error);
        alert(
          'Ocorreu um erro ao processar o pedido. Tente novamente mais tarde.'
        );
        completeOrderBtn.disabled = false;
        completeOrderBtn.textContent = 'Pedido Completo';
      });
  });
});
