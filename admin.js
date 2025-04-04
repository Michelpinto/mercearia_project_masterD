// login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    fetch('/api/admin_login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          errorMessage.textContent = '';
          alert('Login Successful! Redirecting to admin dashboard...');
          window.location.href = '/admin_dashboard.html';
        } else {
          errorMessage.textContent =
            data.error || 'Invalid username or password';
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        errorMessage.textContent = 'An error occurred. Please try again later.';
      });
  });
});

// admin

let products = [];
let orders = [];

// DOM references
const totalProductsEl = document.getElementById('total-products');
const totalOrdersEl = document.getElementById('total-orders');
const totalCustomersEl = document.getElementById('total-customers');

const productsTableBody = document.getElementById('products-table-body');
const ordersTableBody = document.getElementById('orders-table-body');

const tabTriggers = document.querySelectorAll('.tab-trigger');
const tabContents = document.querySelectorAll('.tab-content');

const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');

let editingProduct = null;

// --- Utility Functions ---
function switchTab(tabName) {
  tabTriggers.forEach((btn) => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
      btn.classList.add('border-b-2', 'border-grocery-green');
    } else {
      btn.classList.remove('active', 'border-b-2', 'border-grocery-green');
    }
  });
  tabContents.forEach((content) => {
    if (content.id === tabName + '-tab') {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
}

function updateStats() {
  totalProductsEl.textContent = products.length;
  totalOrdersEl.textContent = orders.length;
  totalCustomersEl.textContent = orders.length;
}

function renderProductsTable() {
  productsTableBody.innerHTML = '';
  products.forEach((product) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-4 py-2">${product.id}</td>
      <td class="px-4 py-2">${product.name}</td>
      <td class="px-4 py-2">${product.category}</td>
      <td class="px-4 py-2 text-right">€${parseFloat(product.price).toFixed(
        2
      )}</td>
      <td class="px-4 py-2 text-right">${product.quantity}</td>
      <td class="px-4 py-2 text-right"><button class="edit-btn text-blue-500" data-id="${
        product.id
      }">Edit</button></td>
    `;
    productsTableBody.appendChild(tr);
  });
}

function renderOrdersTable() {
  ordersTableBody.innerHTML = '';
  orders.forEach((order) => {
    const customerName = order.customer_name || 'N/A';
    const orderDate = order.created_at || 'N/A';
    const totalItems = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + item.quantity, 0)
      : 'N/A';
    const totalPrice = order.total_price || order.totalPrice || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="px-4 py-2">#${order.id}</td>
        <td class="px-4 py-2">${customerName}</td>
        <td class="px-4 py-2">${orderDate}</td>
        <td class="px-4 py-2">${totalItems}</td>
        <td class="px-4 py-2 text-right">€${parseFloat(totalPrice).toFixed(
          2
        )}</td>
        <td class="px-4 py-2 text-right"><button class="more-btn text-gray-500">...</button></td>
      `;
    ordersTableBody.appendChild(tr);
  });
}

function openModal() {
  productModal.classList.remove('hidden');
}

function closeModal() {
  productModal.classList.add('hidden');
  productForm.reset();
  editingProduct = null;
  modalTitle.textContent = 'Add New Product';
}

function handleEditProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  editingProduct = product;
  modalTitle.textContent = 'Edit Product';
  productForm['name'].value = product.name;
  productForm['price'].value = product.price;
  productForm['quantity'].value = product.quantity;
  productForm['category'].value = product.category;
  productForm['image'].value = product.image || '';
  productForm['description'].value = product.description || '';
  openModal();
}

tabTriggers.forEach((btn) => {
  btn.addEventListener('click', () => {
    switchTab(btn.getAttribute('data-tab'));
  });
});

addProductBtn.addEventListener('click', () => {
  editingProduct = null;
  modalTitle.textContent = 'Add New Product';
  openModal();
});

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(productForm);
  const newProduct = {
    name: formData.get('name'),
    price: parseFloat(formData.get('price')),
    quantity: parseInt(formData.get('quantity')),
    category: formData.get('category'),
    image: formData.get('image'),
    description: formData.get('description'),
  };

  if (editingProduct) {
    products = products.map((p) =>
      p.id === editingProduct.id ? { ...p, ...newProduct } : p
    );
    alert(`${newProduct.name} has been updated successfully`);
  } else {
    newProduct.id =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    products.push(newProduct);
    alert(`${newProduct.name} has been added to inventory`);
  }
  updateStats();
  renderProductsTable();
  closeModal();
});

productsTableBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const id = parseInt(e.target.getAttribute('data-id'));
    handleEditProduct(id);
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  window.location.href = '/admin.html';
});

// --- API Calls ---
function loadDashboardData() {
  fetch('/api/get_products.php')
    .then((response) => response.json())
    .then((data) => {
      products = data;
      updateStats();
      renderProductsTable();
    })
    .catch((error) => console.error('Error loading products:', error));

  fetch('/api/get_orders.php')
    .then((response) => response.json())
    .then((data) => {
      orders = data;
      console.log(orders);
      updateStats();
      renderOrdersTable();
    })
    .catch((error) => console.error('Error loading orders:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  switchTab('products');
});
