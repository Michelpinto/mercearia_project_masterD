let products = [];
let cartItems = [];
let selectedCategory = null;
let searchTerm = '';

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
  const savedCart = localStorage.getItem('cartItems');
  cartItems = savedCart ? JSON.parse(savedCart) : [];

  updateCartBadge();

  fetch('/api/get_products.php')
    .then((response) => response.json())
    .then((data) => {
      products = data;
      renderProducts();
      renderFilters();
      renderCart();
    })
    .catch((error) => console.error('Error loading products:', error));
}

function createProductCard(
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity
) {
  const card = document.createElement('div');
  card.className =
    'product-card flex flex-col h-full border rounded-lg shadow-sm bg-white hover:shadow-lg transition-shadow duration-200 ease-in-out';

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
    outStockText.textContent = 'Esgotado';
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

  const stockEl = document.createElement('p');
  stockEl.className = 'text-gray-600 text-sm mb-4 flex-grow';
  stockEl.textContent =
    product.quantity > 0
      ? `${product.quantity} disponíveis`
      : 'Atualmente indisponível';
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
        alert(product.name + ' removido do carrinho');
      }
    });

    const quantitySpan = document.createElement('span');
    quantitySpan.className = 'font-medium';
    quantitySpan.textContent = quantity;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn-outline h-8 w-8';
    plusBtn.textContent = '+';
    if (quantity >= product.quantity) {
      plusBtn.disabled = true;
    } else {
      plusBtn.disabled = false;
    }
    plusBtn.addEventListener('click', () => {
      if (product.quantity <= 0) {
        alert('Este produto está esgotado');
        return;
      }
      if (quantity >= product.quantity) {
        alert(`Apenas ${product.quantity} ${product.name} disponíveis`);
        return;
      }
      onUpdateQuantity(product.id, quantity + 1);
      alert(`Carrinho actualizado: ${product.name} x${quantity + 1}`);
    });

    controls.appendChild(minusBtn);
    controls.appendChild(quantitySpan);
    controls.appendChild(plusBtn);
    details.appendChild(controls);
  } else {
    const addBtn = document.createElement('button');
    addBtn.className =
      'w-full btn-primary py-2 rounded text-white bg-grocery-green';
    addBtn.textContent = 'Adicionar ao carrinho';
    if (product.quantity <= 0) {
      addBtn.disabled = true;
      addBtn.style.backgroundColor = '#ccc';
      addBtn.style.color = '#888';
    } else {
      addBtn.disabled = false;
    }
    addBtn.addEventListener('click', () => {
      if (product.quantity <= 0) {
        alert('Este produto está esgotado');
        return;
      }
      onAddToCart(product);
      alert(product.name + ' adicionado ao carrinho');
    });
    details.appendChild(addBtn);
  }

  card.appendChild(details);
  return card;
}

function renderProducts() {
  const gridContainer = document.getElementById('productsGrid');
  gridContainer.innerHTML = '';

  let filteredProducts = products;
  if (selectedCategory !== null) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  if (searchTerm && searchTerm.trim() !== '') {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const grid = renderProductGrid(
    filteredProducts,
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
  allButton.textContent = 'Todos';
  allButton.className = 'px-3 py-1 rounded-[12px] border border-green-500/50';
  allButton.onclick = () => {
    selectedCategory = null;
    renderProducts();
    renderFilters();
  };
  if (selectedCategory === null) {
    allButton.className =
      'px-3 py-1 rounded-[12px] bg-grocery-green text-white';
  }
  filterDiv.appendChild(allButton);

  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    btn.className =
      'px-3 py-1 rounded-[12px] border border-green-500/50 hover:bg-green-100';
    btn.onclick = () => {
      selectedCategory = category;
      renderProducts();
      renderFilters();
    };
    if (selectedCategory === category) {
      btn.className = 'px-3 py-1 rounded-[12px] bg-grocery-green text-white';
    }
    filterDiv.appendChild(btn);
  });
}

function syncCartUI() {
  updateCartStorage();
  updateCartBadge();
  renderCart();
  renderProducts();
}

function onAddToCart(product) {
  const item = cartItems.find((item) => item.productId === product.id);
  if (item) {
    if (item.quantity < product.quantity) {
      item.quantity++;
    } else {
      alert(`Apenas ${product.quantity} ${product.name} disponíveis`);
    }
  } else {
    cartItems.push({ productId: product.id, quantity: 1 });
  }
  syncCartUI();
  toggleCart();
}

function onRemoveFromCart(productId) {
  cartItems = cartItems.filter((item) => item.productId !== productId);
  syncCartUI();
}

function onUpdateQuantity(productId, quantity) {
  const product = products.find((p) => p.id === productId);
  if (!product || quantity > product.quantity) {
    alert(`Apenas ${product.quantity} ${product.name} disponíveis`);
    return;
  }
  cartItems = cartItems.map((item) => {
    if (item.productId === productId) {
      return { ...item, quantity: quantity };
    }
    return item;
  });
  syncCartUI();
}

function updateCartStorage() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    badge.classList.toggle('hidden', totalQuantity === 0);
    badge.textContent = totalQuantity > 0 ? totalQuantity : '';
  }
}

function renderEmptyCart() {
  const emptyDiv = document.createElement('div');
  emptyDiv.className =
    'flex-grow flex flex-col items-center justify-center p-8';

  const titleEl = document.createElement('h2');
  titleEl.className = 'text-2xl font-bold mb-4';
  titleEl.textContent = 'Seu carrinho está vazio';
  emptyDiv.appendChild(titleEl);

  const messageEl = document.createElement('p');
  messageEl.className = 'text-gray-500 text-center mb-6';
  messageEl.textContent =
    'Adicione alguns produtos ao carrinho para visualizar aqui.';
  emptyDiv.appendChild(messageEl);

  const continueBtn = document.createElement('button');
  continueBtn.className = 'btn-primary py-2 px-4 rounded';
  continueBtn.textContent = 'Continuar comprando';
  continueBtn.addEventListener('click', toggleCart);
  emptyDiv.appendChild(continueBtn);

  return emptyDiv;
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const cartFooter = document.getElementById('cartFooter');
  container.innerHTML = '';

  if (cartItems.length === 0) {
    container.appendChild(renderEmptyCart());
    cartFooter.classList.add('hidden');
    updateCartBadge();
    return;
  }

  cartFooter.classList.remove('hidden');

  let total = 0;

  cartItems.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;
    total += product.price * item.quantity;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item flex items-center space-x-4 border-b pb-4';

    const imgContainer = document.createElement('div');
    imgContainer.className =
      'h-16 w-16 bg-grocery-light-green/20 rounded flex items-center justify-center';
    const img = document.createElement('img');
    img.src = product.image || 'https://via.placeholder.com/100?text=Product';
    img.alt = product.name;
    img.className = 'max-h-12 max-w-12 object-contain';
    imgContainer.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-grow';
    const nameEl = document.createElement('h4');
    nameEl.className = 'font-medium';
    nameEl.textContent = product.name;
    const priceEl = document.createElement('p');
    priceEl.className = 'text-sm text-gray-500';
    priceEl.textContent = '€' + parseFloat(product.price).toFixed(2) + ' cada';
    infoDiv.appendChild(nameEl);
    infoDiv.appendChild(priceEl);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flex items-center space-x-2';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'btn-outline h-7 w-7 flex items-center justify-center';
    minusBtn.textContent = '-';
    minusBtn.addEventListener('click', () => {
      if (item.quantity > 1) {
        onUpdateQuantity(item.productId, item.quantity - 1);
      } else {
        onRemoveFromCart(item.productId);
      }
    });

    const qtySpan = document.createElement('span');
    qtySpan.className = 'w-6 text-center';
    qtySpan.textContent = item.quantity;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn-outline h-7 w-7 flex items-center justify-center';
    plusBtn.textContent = '+';
    plusBtn.disabled = product.quantity <= item.quantity;
    plusBtn.addEventListener('click', () => {
      const currentProduct = products.find((p) => p.id === item.productId);
      if (currentProduct && item.quantity < currentProduct.quantity) {
        onUpdateQuantity(item.productId, item.quantity + 1);
      }
    });

    controlsDiv.appendChild(minusBtn);
    controlsDiv.appendChild(qtySpan);
    controlsDiv.appendChild(plusBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-ghost text-gray-400 hover:text-grocery-red';
    removeBtn.innerHTML = '<i data-lucide="x" class="h-4 w-4"></i>';
    removeBtn.addEventListener('click', () => {
      onRemoveFromCart(item.productId);
    });

    itemDiv.appendChild(imgContainer);
    itemDiv.appendChild(infoDiv);
    itemDiv.appendChild(controlsDiv);
    itemDiv.appendChild(removeBtn);

    container.appendChild(itemDiv);
  });

  document.getElementById('cartTotal').textContent = '€' + total.toFixed(2);
}

function toggleCart() {
  const cartModal = document.getElementById('cartModal');
  if (cartModal.classList.contains('hidden')) {
    cartModal.classList.remove('hidden');
  } else {
    cartModal.classList.add('hidden');
  }
}

document.getElementById('closeCart').addEventListener('click', toggleCart);
document.getElementById('cartOverlay').addEventListener('click', toggleCart);

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
    top: document.querySelector('.text-3xl').offsetTop,
    behavior: 'smooth',
  });
});

window.onload = loadProducts;
