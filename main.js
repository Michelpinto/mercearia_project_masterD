let products = [];
let cartItems = [];
let selectedCategory = null;
let searchTerm = '';

function createProductCard(
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity
) {
  const card = document.createElement('div');
  card.className = 'product-card flex flex-col h-full product';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'relative h-48 bg-grocery-light-green/20';
  const img = document.createElement('img');
  img.src = product.image || 'https://via.placeholder.com/300x200?text=Product';
  img.alt = product.name;
  img.className = 'w-full h-full object-contain p-4';
  imageContainer.appendChild(img);

  if (product.quantity <= 0) {
    const overlay = document.createElement('div');
    overlay.className =
      'absolute inset-0 bg-black/50 flex items-center justify-center';
    const outStockText = document.createElement('span');
    outStockText.className =
      'bg-grocery-red text-white px-3 py-1 rounded-full text-sm font-semibold';
    outStockText.textContent = 'Out of Stock';
    overlay.appendChild(outStockText);
    imageContainer.appendChild(overlay);
  }
  card.appendChild(imageContainer);

  const details = document.createElement('div');
  details.className = 'p-4 flex flex-col flex-grow';

  const nameEl = document.createElement('h3');
  nameEl.className = 'font-medium text-lg mb-1';
  nameEl.textContent = product.name;
  details.appendChild(nameEl);

  const priceEl = document.createElement('p');
  priceEl.className = 'text-grocery-green font-semibold mb-2';
  priceEl.textContent = '€' + parseFloat(product.price).toFixed(2);
  details.appendChild(priceEl);

  // Stock information
  const stockEl = document.createElement('p');
  stockEl.className = 'text-gray-600 text-sm mb-4 flex-grow';
  stockEl.textContent =
    product.quantity > 0
      ? product.quantity + ' available'
      : 'Currently unavailable';
  details.appendChild(stockEl);

  if (quantity > 0) {
    const controls = document.createElement('div');
    controls.className = 'flex items-center justify-between';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'btn-outline h-8 w-8';
    minusBtn.textContent = '-';
    minusBtn.addEventListener('click', () => {
      if (quantity > 1) {
        onUpdateQuantity(product.id, quantity - 1);
      } else if (quantity === 1) {
        onRemoveFromCart(product.id);
        alert(product.name + ' removed from cart');
      }
    });

    const quantitySpan = document.createElement('span');
    quantitySpan.className = 'font-medium';
    quantitySpan.textContent = quantity;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn-outline h-8 w-8';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => {
      if (product.quantity <= 0) {
        alert('This product is out of stock');
        return;
      }
      if (quantity >= product.quantity) {
        alert(
          'Only ' +
            product.quantity +
            ' ' +
            product.name +
            ' available in stock'
        );
        return;
      }
      onUpdateQuantity(product.id, quantity + 1);
      alert('Cart updated: ' + product.name + ' x' + (quantity + 1));
    });

    controls.appendChild(minusBtn);
    controls.appendChild(quantitySpan);
    controls.appendChild(plusBtn);
    details.appendChild(controls);
  } else {
    const addBtn = document.createElement('button');
    addBtn.className = 'w-full btn-primary';
    addBtn.innerHTML =
      '<span><!-- ShoppingBag icon placeholder --></span> Add to Cart';
    addBtn.disabled = product.quantity <= 0;
    addBtn.addEventListener('click', () => {
      if (product.quantity <= 0) {
        alert('This product is out of stock');
        return;
      }
      onAddToCart(product);
      alert(product.name + ' added to cart');
    });
    details.appendChild(addBtn);
  }

  card.appendChild(details);
  return card;
}

function renderProductGrid(
  products,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity
) {
  const grid = document.createElement('div');
  grid.className =
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

  products.forEach((product) => {
    const cartItem = cartItems.find((item) => item.productId === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const productCard = createProductCard(
      product,
      quantity,
      onAddToCart,
      onRemoveFromCart,
      onUpdateQuantity
    );
    grid.appendChild(productCard);
  });

  return grid;
}

function loadProducts() {
  fetch('/api/get_products.php')
    .then((response) => response.json())
    .then((data) => {
      products = data;
      console.log(products);
      renderProducts();
      renderFilters();
    })
    .catch((error) => console.error('Error loading products:', error));
}

function renderProducts() {
  const gridContainer = document.getElementById('productsGrid');
  gridContainer.innerHTML = '';
  const grid = renderProductGrid(
    products,
    cartItems,
    onAddToCart,
    onRemoveFromCart,
    onUpdateQuantity
  );
  gridContainer.appendChild(grid);
}

function renderFilters() {
  const filterDiv = document.getElementById('filterButtons');
  filterDiv.innerHTML = '';
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const allButton = document.createElement('button');
  allButton.textContent = 'All';
  allButton.onclick = () => {
    selectedCategory = null;
    renderProducts();
    renderFilters();
  };
  if (selectedCategory === null) {
    allButton.style.background = '#4CAF50';
    allButton.style.color = '#fff';
  }
  filterDiv.appendChild(allButton);

  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    btn.onclick = () => {
      selectedCategory = category;
      renderProducts();
      renderFilters();
    };
    if (selectedCategory === category) {
      btn.style.background = '#4CAF50';
      btn.style.color = '#fff';
    }
    filterDiv.appendChild(btn);
  });
}

function onAddToCart(product) {
  const item = cartItems.find((item) => item.productId === product.id);
  if (item) {
    if (item.quantity < product.quantity) {
      item.quantity++;
    } else {
      alert(`Only ${product.quantity} ${product.name} available in stock`);
    }
  } else {
    cartItems.push({ productId: product.id, quantity: 1 });
  }
  renderProducts();
  renderCart();
}

function onRemoveFromCart(productId) {
  cartItems = cartItems.filter((item) => item.productId !== productId);
  renderProducts();
  renderCart();
}

function onUpdateQuantity(productId, quantity) {
  const product = products.find((p) => p.id === productId);
  if (!product || quantity > product.quantity) {
    alert(`Only ${product.quantity} ${product.name} available in stock`);
    return;
  }
  cartItems = cartItems.map((item) => {
    if (item.productId === productId) {
      return { productId, quantity };
    }
    return item;
  });
  renderProducts();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  container.innerHTML = '';
  let total = 0;
  cartItems.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;
    total += product.price * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <p>€${parseFloat(product.price).toFixed(2)} each</p>
        <p>Quantity: ${item.quantity}</p>
      </div>
      <div>
        <button onclick="onUpdateQuantity(${product.id}, ${
      item.quantity - 1
    })">-</button>
        <button onclick="onUpdateQuantity(${product.id}, ${
      item.quantity + 1
    })">+</button>
        <button onclick="onRemoveFromCart(${product.id})">Remove</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });
  document.getElementById('cartTotal').textContent =
    'Total: €' + total.toFixed(2);
  document.getElementById('cartCount').textContent = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

function toggleCart() {
  document.getElementById('cartModal').classList.toggle('open');
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

document.getElementById('clearFilters').addEventListener('click', () => {
  searchTerm = '';
  selectedCategory = null;
  document.getElementById('searchInput').value = '';
  renderProducts();
  renderFilters();
});

document.getElementById('cartToggle').addEventListener('click', toggleCart);
document.getElementById('closeCart').addEventListener('click', toggleCart);
document.getElementById('shopNow').addEventListener('click', () => {
  window.scrollTo({
    top: document.querySelector('.container').offsetTop,
    behavior: 'smooth',
  });
});

window.onload = loadProducts;
