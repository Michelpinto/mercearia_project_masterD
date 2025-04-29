let products = [];
let orders = [];
let editingProduct = null;

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

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
const logoutButton = document.getElementById('logout-btn');

// login
function initLogin() {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    try {
      const res = await fetch('/api/admin_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.message) {
        alert(`Login efetuado com sucesso, bem vindo ${username}...`);
        window.location.href = '/admin_dashboard.php';
      } else {
        errorMessage.textContent =
          data.error || 'Password ou username inválidos.';
      }
    } catch (err) {
      console.error('Error during login:', err);
      errorMessage.textContent = 'Erro ao efetuar login. Tente novamente.';
    }
  });
}

// dashboard
function switchTab(tabName) {
  tabTriggers.forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('border-b-2', isActive);
    btn.classList.toggle('border-grocery-green', isActive);
  });
  tabContents.forEach((c) => {
    c.id === `${tabName}-tab`
      ? c.classList.remove('hidden')
      : c.classList.add('hidden');
  });
}

function updateStats() {
  totalProductsEl.textContent = products.length;
  totalOrdersEl.textContent = orders.length;
  totalCustomersEl.textContent = orders.length;
}

function renderProductsTable() {
  productsTableBody.innerHTML = '';
  products.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-4 py-2">${p.id}</td>
      <td class="px-4 py-2">${p.name}</td>
      <td class="px-4 py-2">${p.category}</td>
      <td class="px-4 py-2 text-right">€${parseFloat(p.price).toFixed(2)}</td>
      <td class="px-4 py-2 text-right">${p.quantity}</td>
      <td class="px-4 py-2 text-right">
        <button class="edit-btn text-blue-500" data-id="${p.id}">
        Editar
        </button>
        <button class="delete-btn text-red-500 ml-2" data-id="${p.id}">
        Apagar
        </button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
  lucide.createIcons();
}

function renderOrdersTable() {
  ordersTableBody.innerHTML = '';

  orders.forEach((order) => {
    const cust = order.customer_name;
    const date = new Date(order.created_at).toLocaleDateString();
    const items = Array.isArray(order.items)
      ? order.items.map((i) => i.quantity).reduce((a, b) => a + b, 0)
      : 0;
    const total = parseFloat(order.total_price).toFixed(2);

    const summaryRow = document.createElement('tr');
    summaryRow.innerHTML = `
      <td class="px-4 py-2">#${order.id}</td>
      <td class="px-4 py-2">${cust}</td>
      <td class="px-4 py-2">${date}</td>
      <td class="px-4 py-2">${items} item${items !== 1 ? 's' : ''}</td>
      <td class="px-4 py-2 text-right">€${total}</td>
      <td class="px-4 py-2 text-right">
        <button class="toggle-details-btn text-blue-500 hover:underline">Ver</button>
      </td>
    `;
    ordersTableBody.appendChild(summaryRow);

    const detailRow = document.createElement('tr');
    detailRow.classList.add('details-row', 'hidden', 'bg-gray-50');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'px-4 py-4';

    let html = `
      <div class="mb-4">
        <h3 class="font-medium mb-2">Informações do Cliente</h3>
        <p><strong>Nome:</strong> ${cust}</p>
        <p><strong>Data de Nasc.:</strong> ${order.birth_date}</p>
        <p><strong>Morada:</strong> ${order.address}</p>
      </div>
      <div>
        <h3 class="font-medium mb-2">Produtos</h3>
        <table class="w-full text-sm border-collapse">
          <thead class="border-b">
            <tr>
              <th class="py-1 text-left">Produto</th>
              <th class="py-1 text-center">Qtd.</th>
              <th class="py-1 text-right">Preço</th>
              <th class="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
    `;
    order.items.forEach((i) => {
      const sub = (parseFloat(i.price_per_unit) * i.quantity).toFixed(2);
      html += `
        <tr class="border-b">
          <td class="py-1">${i.product_name}</td>
          <td class="py-1 text-center">${i.quantity}</td>
          <td class="py-1 text-right">€${parseFloat(i.price_per_unit).toFixed(
            2
          )}</td>
          <td class="py-1 text-right">€${sub}</td>
        </tr>
      `;
    });
    html += `
          </tbody>
        </table>
        <div class="mt-2 text-right font-semibold">Total: €${total}</div>
      </div>
    `;
    cell.innerHTML = html;
    detailRow.appendChild(cell);
    ordersTableBody.appendChild(detailRow);

    summaryRow
      .querySelector('.toggle-details-btn')
      .addEventListener('click', (e) => {
        const isHidden = detailRow.classList.toggle('hidden');
        e.currentTarget.textContent = isHidden ? 'Ver' : 'Ocultar';
      });
  });
}

function openModal() {
  productModal.classList.remove('hidden');
}
function closeModal() {
  productModal.classList.add('hidden');
  productForm.reset();
  editingProduct = null;
  modalTitle.textContent = 'Adicionar Produto';
}

function handleDeleteProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  if (confirm(`Tem a certeza que deseja apagar ${product.name}?`)) {
    products = products.filter((p) => p.id !== id);
    renderProductsTable();
    updateStats();
    alert(`${product.name} apagado.`);
  }
}

function attachDashboardEventListeners() {
  tabTriggers.forEach((btn) =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab))
  );

  addProductBtn.addEventListener('click', () => {
    editingProduct = null;
    modalTitle.textContent = 'Adicionar Produto';
    openModal();
  });
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(productForm);
    const payload = {
      name: fd.get('name'),
      price: parseFloat(fd.get('price')),
      quantity: parseInt(fd.get('quantity')),
      category: fd.get('category'),
      image: fd.get('image'),
    };
    try {
      const url = editingProduct
        ? '/api/edit_product.php'
        : '/api/add_product.php';
      if (editingProduct) payload.id = editingProduct.id;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.error) {
        if (editingProduct) {
          products = products.map((p) =>
            p.id === editingProduct.id ? { ...p, ...payload } : p
          );
          alert(`${payload.name} atualizado.`);
        } else {
          payload.id = data.id || Math.max(...products.map((p) => p.id)) + 1;
          products.push(payload);
          alert(`${payload.name} adicionado.`);
        }
      } else {
        alert(`Erro: ${data.error}`);
      }
      updateStats();
      renderProductsTable();
      closeModal();
    } catch (err) {
      console.error('Product save error:', err);
      alert('Erro ao salvar produto.');
    }
  });

  async function handleDeleteProduct(id) {
    if (!confirm('Tem a certeza que deseja apagar este produto?')) return;
    try {
      const res = await fetch('/api/delete_product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.message) {
        products = products.filter((p) => p.id !== id);
        updateStats();
        renderProductsTable();
        alert(data.message);
      } else {
        alert('Erro: ' + (data.error || 'Não foi possível apagar'));
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Ocorreu um erro ao apagar o produto.');
    }
  }

  productsTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.matches('.edit-btn')) {
      handleEditProduct(Number(btn.dataset.id));
    } else if (btn.matches('.delete-btn')) {
      handleDeleteProduct(Number(btn.dataset.id));
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      window.location.href = '/api/logout.php';
    });
  }
}

async function loadOrderItems() {
  const res = await fetch('/api/get_order_items.php');
  const data = await res.json();
  return data.map((i) => ({
    ...i,
    order_id: Number(i.order_id),
    product_id: Number(i.product_id),
    quantity: Number(i.quantity),
  }));
}

async function loadDashboardData() {
  try {
    let res1 = await fetch('/api/get_products.php');
    products = (await res1.json()).map((p) => ({ ...p, id: Number(p.id) }));
    updateStats();
    renderProductsTable();

    let res2 = await fetch('/api/get_orders.php');
    orders = await res2.json();

    const items = await loadOrderItems();
    orders = orders.map((o) => ({
      ...o,
      items: items.filter((i) => i.order_id === Number(o.id)),
    }));
    updateStats();
    renderOrdersTable();
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (loginForm) {
    initLogin();
  } else {
    attachDashboardEventListeners();
    loadDashboardData();
    switchTab('products');
  }
});
