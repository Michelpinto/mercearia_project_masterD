<?php require_once 'api/auth_check.php';

require_once './config.php';

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FreshMarket Admin Dashboard</title>
    <link rel="stylesheet" href="/styles.css" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-grocery-green text-white shadow-md">
      <div
        class="container mx-auto px-4 py-4 flex justify-between items-center"
      >
        <div class="flex items-center space-x-2">
          <span class="bg-white text-grocery-green p-2 rounded-full">
            <i data-lucide="apple" class="lucide-apple"> </i>
          </span>
          <h1 class="text-xl font-display font-bold">FreshMarket Admin</h1>
        </div>
        <button
          id="logout-btn"
          class="text-white bg-transparent border-0 flex items-center"
        >
          <i data-lucide="log-out" class="mr-2 h-4 w-4"> </i>
          Terminar sessão
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto py-8 px-4">
      <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-cards">
        <div class="card border rounded-lg shadow-sm bg-white p-6">
          <div class="card-header pb-2">
            <h3 class="card-title text-sm font-medium text-gray-500">
              Produtos
            </h3>
          </div>
          <div class="card-content">
            <div class="flex items-center">
              <i data-lucide="Package" class="h-8 w-8 text-grocery-green mr-3">
              </i>
              <span id="total-products" class="text-3xl font-bold">0</span>
            </div>
          </div>
        </div>

        <div class="card border rounded-lg shadow-sm bg-white p-6">
          <div class="card-header pb-2">
            <h3 class="card-title text-sm font-medium text-gray-500">
              Encomendas
            </h3>
          </div>
          <div class="card-content">
            <div class="flex items-center">
              <i
                data-lucide="shopping-bag"
                class="h-8 w-8 text-grocery-orange mr-3"
              >
              </i>
              <span id="total-orders" class="text-3xl font-bold">0</span>
            </div>
          </div>
        </div>

        <div class="card border rounded-lg shadow-sm bg-white p-6">
          <div class="card-header pb-2">
            <h3 class="card-title text-sm font-medium text-gray-500">
              Clientes
            </h3>
          </div>
          <div class="card-content">
            <div class="flex items-center">
              <i data-lucide="users" class="h-8 w-8 text-blue-500 mr-3"> </i>
              <span id="total-customers" class="text-3xl font-bold">0</span>
            </div>
          </div>
        </div>
      </div>

      <div id="tabs-container">
        <div class="tabs mb-6 flex space-x-4 border-b">
          <button
            class="tab-trigger active pb-2 border-b-2 border-grocery-green flex items-center"
            data-tab="products"
          >
            <i data-lucide="package" class="h-4 w-4 mr-2"> </i>
            Produtos
          </button>
          <button
            class="tab-trigger active pb-2 border-b-2 border-grocery-green flex items-center"
            data-tab="orders"
          >
            <i data-lucide="clipboard" class="h-4 w-4 mr-2"> </i>
            Encomendas
          </button>
        </div>

        <div class="tab-content" id="products-tab">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-display font-bold text-grocery-green">
              Lista de Produtos
            </h2>
            <button
              id="add-product-btn"
              class="bg-grocery-green hover:bg-grocery-green/90 text-white py-2 px-4 rounded inline-flex items-center"
            >
              <i data-lucide="plus" class="mr-2 h-4 w-4"> </i>

              Adicionar Produto
            </button>
          </div>
          <div
            class="card p-4 overflow-auto rounded-lg border bg-card text-card-foreground shadow-sm"
            id="products-table-container"
          >
            <table class="w-full text-sm">
              <thead class="border-b">
                <tr>
                  <th class="px-4 py-2 text-left">ID</th>
                  <th class="px-4 py-2 text-left">Nome</th>
                  <th class="px-4 py-2 text-left">Categoria</th>
                  <th class="px-4 py-2 text-right">Preço</th>
                  <th class="px-4 py-2 text-right">Quantidade</th>
                  <th class="px-4 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="products-table-body"></tbody>
            </table>
          </div>
        </div>

        <div class="tab-content hidden" id="orders-tab">
          <div class="mb-6">
            <h2 class="text-2xl font-display font-bold text-grocery-green">
              Histórico de Encomendas
            </h2>
          </div>
          <div
            class="card p-4 overflow-auto rounded-lg border bg-card text-card-foreground shadow-sm"
            id="orders-table-container"
          >
            <table class="w-full text-sm">
              <thead class="border-b">
                <tr>
                  <th class="px-4 py-2 text-left">ID</th>
                  <th class="px-4 py-2 text-left">Cliente</th>
                  <th class="px-4 py-2 text-left">Data da Encomenda</th>
                  <th class="px-4 py-2 text-left">Artigos</th>
                  <th class="px-4 py-2 text-right">Total</th>
                  <th class="px-4 py-2 text-right">detalhes</th>
                </tr>
              </thead>
              <tbody id="orders-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal for Add/Edit Product -->
    <div
      id="product-modal"
      class="fixed inset-0 flex items-center justify-center bg-black/50 hidden"
    >
      <div class="bg-white rounded-lg w-full max-w-lg p-6 relative">
        <button id="close-modal" class="absolute top-4 right-4 text-gray-600">
          &times;
        </button>
        <h3 id="modal-title" class="text-lg font-semibold mb-4">
          Adicionar Produto
        </h3>
        <form id="product-form" class="space-y-4">
          <div>
            <label
              for="prod-name"
              class="block text-sm font-medium text-gray-700"
              >Nome do produto</label
            >
            <input
              type="text"
              id="prod-name"
              name="name"
              class="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="prod-price"
                class="block text-sm font-medium text-gray-700"
                >Preço (€)</label
              >
              <input
                type="number"
                step="0.01"
                min="0"
                id="prod-price"
                name="price"
                class="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label
                for="prod-quantity"
                class="block text-sm font-medium text-gray-700"
                >Quantidade</label
              >
              <input
                type="number"
                min="0"
                id="prod-quantity"
                name="quantity"
                class="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label
              for="prod-category"
              class="block text-sm font-medium text-gray-700"
              >Categoria</label
            >
            <input
              type="text"
              id="prod-category"
              name="category"
              class="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label
              for="prod-image"
              class="block text-sm font-medium text-gray-700"
              >Imagem URL</label
            >
            <input
              type="text"
              id="prod-image"
              name="image"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              id="cancel-btn"
              class="border rounded px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-grocery-green hover:bg-grocery-green/90 text-white rounded px-4 py-2"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <script src="admin.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
      lucide.createIcons();
    </script>
  </body>
</html>
