// Este arquivo cuida da inicialização e da navegação entre as telas

let currentUserRole = null; // 'chefe' ou 'funcionario'

// Login simples
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();

  // Simulação de autenticação
  if (username === 'chefe' && password === '123') {
    currentUserRole = 'chefe';
    // Persiste sessão
    localStorage.setItem('pront_user_role_v1', 'chefe');
    document.getElementById('userRole').textContent = 'Chefe';
    alert('Login como Chefe');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('systemScreen').classList.remove('hidden');
    showView('catalogView');
    
    document.getElementById('userRole').textContent = 'Chefe';
    document.getElementById('btnNewReserv').style.display = 'block'; // chefe vê
    document.getElementById('btnCatalog').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');
    showSystem();
  } else if (username === 'funcionario' && password === '123') {
    currentUserRole = 'funcionario';
    // Persiste sessão
    localStorage.setItem('pront_user_role_v1', 'funcionario');
    document.getElementById('userRole').textContent = 'Funcionário';
    alert('Login como Funcionário');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('systemScreen').classList.remove('hidden');
    showView('catalogView');

    document.getElementById('userRole').textContent = 'Funcionário';
    document.getElementById('btnNewReserv').style.display = 'none'; // funcionário não vê
    document.getElementById('btnCatalog').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');
    showSystem();
  } else {
    alert('Usuário ou senha inválidos');
  }
});

// Logout
document.getElementById('btnLogout').addEventListener('click', () => {
  currentUserRole = null;
  // Limpa sessão persistida
  localStorage.removeItem('pront_user_role_v1');
  document.getElementById('userRole').textContent = 'Não logado';
  document.getElementById('btnLogout').classList.add('hidden');
  document.getElementById('systemScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
});

// Botões de navegação
document.getElementById('btnCatalog').addEventListener('click', () => showView('catalogView'));
document.getElementById('btnNewReserv').addEventListener('click', () => showView('newView'));
document.getElementById('btnReservations').addEventListener('click', () => showView('reservationsView'));

// Função que mostra a view escolhida e esconde as outras
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const view = document.getElementById(id);
  if (view) {
    view.classList.remove('hidden');
  }

  // Renderiza conteúdo específico de cada view
  if (id === 'catalogView') renderCatalog();
  if (id === 'reservationsView') renderReservations();
  if (id === 'newView') {
    populateItemSelect();
    document.getElementById('selectedItems').innerHTML = '';
  }
}

// Ajusta estoque ao criar/editar reserva
function adjustStockForReservation(reservation, multiplier) {
  const items = loadItems();
  reservation.items.forEach(({ item_id, quantity }) => {
    const item = items.find(x => x.id === item_id);
    if (item) {
      item.total = Math.max(0, item.total + quantity * multiplier);
    }
  });
  saveItems(items);
  renderCatalog();
}

function upsertSelectedItem(itemId, qty, itemName, { replaceExisting = false } = {}) {
  const existingIndex = selected.findIndex(s => s.item_id === itemId);

  if (existingIndex >= 0) {
    if (replaceExisting) {
      selected[existingIndex] = { ...selected[existingIndex], quantity: qty };
    } else {
      selected[existingIndex] = { ...selected[existingIndex], quantity: qty };
    }
  } else {
    selected.push({ item_id: itemId, name: itemName, quantity: qty });
  }

  renderSelected();
}

// Lógica para adicionar itens à reserva
const addItemBtn = document.getElementById('addItemBtn');
if (addItemBtn) {
  addItemBtn.addEventListener('click', () => {
    const itemId = parseInt(document.getElementById('itemSelect').value, 10);
    const qty = parseInt(document.getElementById('itemQty').value, 10);
    const items = loadItems();
    const it = items.find(x => x.id === itemId);

    if (!it) { alert('Item inválido'); return; }
    const date = document.querySelector('input[name="date"]').value;
    if (!date) { alert('Escolha a data do evento primeiro'); return; }
    const editingId = Number(document.getElementById('reservForm').getAttribute('data-editing-id') || 0);
    const avail = availableForDate(itemId, date, editingId);
    if (qty > avail) { alert(`Disponível para ${date}: ${avail}`); return; }

    upsertSelectedItem(itemId, qty, it.name, { replaceExisting: true });
  });
}

// Atualiza um item já adicionado sem criar duplicidade
const updateItemBtn = document.getElementById('updateItemBtn');
if (updateItemBtn) {
  updateItemBtn.addEventListener('click', () => {
    const itemId = parseInt(document.getElementById('itemSelect').value, 10);
    const qty = parseInt(document.getElementById('itemQty').value, 10);
    const items = loadItems();
    const it = items.find(x => x.id === itemId);

    if (!it) { alert('Item inválido'); return; }

    const existing = selected.find(s => s.item_id === itemId);
    if (!existing) {
      alert('Selecione um item já adicionado para atualizar.');
      return;
    }

    const date = document.querySelector('input[name="date"]').value;
    if (!date) { alert('Escolha a data do evento primeiro'); return; }
    const editingId = Number(document.getElementById('reservForm').getAttribute('data-editing-id') || 0);
    const avail = availableForDate(itemId, date, editingId);
    if (qty > avail) { alert(`Disponível para ${date}: ${avail}`); return; }

    upsertSelectedItem(itemId, qty, it.name, { replaceExisting: true });
    alert('Item atualizado com sucesso.');
  });
}

// Renderiza itens selecionados na reserva
function renderSelected() {
  const ul = document.getElementById('selectedItems');
  ul.innerHTML = '';
  selected.forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = `${s.name} x${s.quantity} `;
    const rm = document.createElement('button');
    rm.textContent = 'Remover';
    rm.className = 'btn';
    rm.style.marginLeft = '8px';
    rm.addEventListener('click', () => { selected.splice(idx, 1); renderSelected(); });
    li.appendChild(rm);
    ul.appendChild(li);
  });
}

// Submissão do formulário de reserva
const reservForm = document.getElementById('reservForm');
if (reservForm) {
  reservForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const client = e.target.client.value.trim();
  const location = e.target.location.value.trim();
  const date = e.target.date.value;

  if (!client || !location || !date || selected.length === 0) {
    alert('Preencha todos os campos e adicione ao menos 1 item');
    return;
  }

  // 🚨 Validação: impedir datas passadas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosenDate = new Date(date);
  if (chosenDate < today) {
    alert('Não é possível criar reserva em datas passadas.');
    return;
  }

  // Verificação final de disponibilidade
  const editingId = Number(e.target.getAttribute('data-editing-id') || 0);

  // Verificação final de disponibilidade (ignorando a própria reserva em edição)
  for (const s of selected) {
    const avail = availableForDate(s.item_id, date, editingId);
    if (s.quantity > avail) {
      alert(`Sem estoque suficiente para ${s.name} em ${date}. Disponível: ${avail}`);
      return;
    }
  }

  const reservations = loadReservations();

  if (editingId) {
    // Atualiza reserva existente
    const idx = reservations.findIndex(r => r.id === editingId);
    if (idx >= 0) {
      const previousReservation = reservations[idx];
      adjustStockForReservation(previousReservation, 1);

      reservations[idx] = {
        ...previousReservation,
        client_name: client,
        location,
        event_date: date,
        items: selected.map(s => ({ item_id: s.item_id, name: s.name, quantity: s.quantity })),
        updated_at: new Date().toISOString(),
        status: 'confirmed'
      };

      adjustStockForReservation(reservations[idx], -1);
    }
    alert('Reserva atualizada com sucesso.');
  } else {
    // Cria nova reserva
    const newRes = {
      id: Date.now(),
      client_name: client,
      location,
      event_date: date,
      items: selected.map(s => ({ item_id: s.item_id, name: s.name, quantity: s.quantity })),
      created_at: new Date().toISOString(),
      status: 'confirmed'
    };
    reservations.push(newRes);
    adjustStockForReservation(newRes, -1);
    alert('Reserva criada com sucesso.');
  }

    saveReservations(reservations);

    // Limpa formulário
    selected = [];
    e.target.reset();
    e.target.removeAttribute('data-editing-id');

    // 🔧 Reabilita campos caso tenham sido bloqueados para funcionário
    e.target.client.disabled = false;
    e.target.location.disabled = false;
    e.target.date.disabled = false;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Confirmar';

    showView('reservationsView');
  });
}

// Botão cancelar reserva
document.getElementById('cancelReserv').addEventListener('click', () => {
  selected = [];
  document.getElementById('reservForm').reset();
  renderSelected();

  // Reabilita campos
  const form = document.getElementById('reservForm');
  form.client.disabled = false;
  form.location.disabled = false;
  form.date.disabled = false;
});

// Inicialização: garante que existam chaves no localStorage
if (!localStorage.getItem(STORAGE.ITEMS)) localStorage.setItem(STORAGE.ITEMS, JSON.stringify([]));
if (!localStorage.getItem(STORAGE.RES)) localStorage.setItem(STORAGE.RES, JSON.stringify([]));

// Restaura sessão de login, se houver
(function restoreSession() {
  const savedRole = localStorage.getItem('pront_user_role_v1');
  if (!savedRole) return;
  currentUserRole = savedRole;
  if (currentUserRole === 'chefe') {
    document.getElementById('userRole').textContent = 'Chefe';
    document.getElementById('btnNewReserv').style.display = 'block';
    document.getElementById('btnCatalog').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');
  } else if (currentUserRole === 'funcionario') {
    document.getElementById('userRole').textContent = 'Funcionário';
    document.getElementById('btnNewReserv').style.display = 'none';
    document.getElementById('btnCatalog').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');
  }
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('systemScreen').classList.remove('hidden');
  showView('catalogView');
  if (typeof showSystem === 'function') showSystem();
})();
