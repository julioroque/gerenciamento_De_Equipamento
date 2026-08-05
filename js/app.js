let currentUserRole = null; // 'chefe' ou 'funcionario'
let selected = [];

// ------------------- LOGIN -------------------
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();

  if (username === 'chefe' && password === '123') {
    currentUserRole = 'chefe';
    localStorage.setItem('pront_user_role_v1', 'chefe');
    document.getElementById('userRole').textContent = 'Chefe';
    alert('Login como Chefe');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('systemScreen').classList.remove('hidden');
    document.getElementById('btnNewReserv').style.display = 'block';
    document.getElementById('btnCatalog').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');
    showView('catalogView');
  } else if (username === 'funcionario' && password === '123') {
    currentUserRole = 'funcionario';
    localStorage.setItem('pront_user_role_v1', 'funcionario');
    document.getElementById('userRole').textContent = 'Funcionário';
    alert('Login como Funcionário');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('systemScreen').classList.remove('hidden');
    document.getElementById('btnNewReserv').style.display = 'none';
    document.getElementById('btnCatalog').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');
    showView('catalogView');
  } else {
    alert('Usuário ou senha inválidos');
  }
});

// ------------------- LOGOUT -------------------
document.getElementById('btnLogout').addEventListener('click', () => {
  currentUserRole = null;
  localStorage.removeItem('pront_user_role_v1');
  document.getElementById('userRole').textContent = 'Não logado';
  document.getElementById('btnLogout').classList.add('hidden');
  document.getElementById('systemScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
});

// ------------------- NAVEGAÇÃO -------------------
document.getElementById('btnCatalog').addEventListener('click', () => showView('catalogView'));
document.getElementById('btnNewReserv').addEventListener('click', () => showView('newView'));
document.getElementById('btnReservations').addEventListener('click', () => showView('reservationsView'));

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const view = document.getElementById(id);
  if (view) view.classList.remove('hidden');

  if (id === 'catalogView') renderCatalog();
  if (id === 'reservationsView') renderReservations();
  if (id === 'newView') {
    populateItemSelect();
    document.getElementById('selectedItems').innerHTML = '';
  }
}

// ------------------- CATÁLOGO -------------------
async function renderCatalog(){
  const list = document.getElementById('catalogList');
  list.innerHTML = '<p>Carregando...</p>';

  try {
    const resp = await fetch('/api/equipamentos');
    const items = await resp.json();
    list.innerHTML = '';

    if(items.length === 0){
      list.innerHTML = '<div class="card">Nenhum equipamento cadastrado.</div>';
      return;
    }

    items.forEach(it=>{
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <strong>${it.name}</strong> (${it.code})<br/>
        Total: ${it.total}
        <div class="row">
          ${currentUserRole === 'chefe' ? `
            <button class="btn" data-remove-id="${it._id}">Remover</button>
          ` : ``}
        </div>
      `;
      list.appendChild(div);
    });

    if(currentUserRole === 'chefe'){
      list.querySelectorAll('[data-remove-id]').forEach(btn=>{
        btn.addEventListener('click', ()=> removeEquipment(btn.getAttribute('data-remove-id')));
      });
    }

  } catch(err){
    list.innerHTML = '<p>Erro ao carregar catálogo.</p>';
    console.error(err);
  }
}

async function addEquipment(equipment){
  await fetch('/api/equipamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipment)
  });
  renderCatalog();
}

async function removeEquipment(id){
  await fetch(`/api/equipamentos?id=${id}`, { method: 'DELETE' });
  renderCatalog();
}

// ------------------- RESERVAS -------------------
async function renderReservations(){
  const list = document.getElementById('reservationsList');
  list.innerHTML = '<p>Carregando...</p>';

  try {
    const resp = await fetch('/api/reservas');
    const reservations = await resp.json();
    list.innerHTML = '';

    if(reservations.length === 0){
      list.innerHTML = '<div class="card">Nenhuma reserva encontrada.</div>';
      return;
    }

    reservations.forEach(r=>{
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <strong>${r.client_name}</strong> - ${r.location}<br/>
        Data: ${r.event_date}<br/>
        Itens: ${r.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
      `;
      list.appendChild(div);
    });

  } catch(err){
    list.innerHTML = '<p>Erro ao carregar reservas.</p>';
    console.error(err);
  }
}

async function addReservation(reservation){
  await fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation)
  });
  renderReservations();
}

// ------------------- FORMULÁRIO DE RESERVA -------------------
const reservForm = document.getElementById('reservForm');
if (reservForm) {
  reservForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const client = e.target.client.value.trim();
    const location = e.target.location.value.trim();
    const date = e.target.date.value;

    if (!client || !location || !date || selected.length === 0) {
      alert('Preencha todos os campos e adicione ao menos 1 item');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(date);
    if (chosenDate < today) {
      alert('Não é possível criar reserva em datas passadas.');
      return;
    }

    const newRes = {
      client_name: client,
      location,
      event_date: date,
      items: selected.map(s => ({
        item_id: s.item_id,
        name: s.name,
        quantity: s.quantity
      }))
    };

    try {
      await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRes)
      });

      alert('Reserva criada com sucesso!');
      selected = [];
      e.target.reset();
      renderReservations();
      showView('reservationsView');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar reserva.');
    }
  });
}

document.getElementById('cancelReserv').addEventListener('click', () => {
  selected = [];
  reservForm.reset();
  renderSelected();
});

function renderSelected() {
  const ul = document.getElementById('selectedItems');
  ul.innerHTML = '';

  selected.forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = `${s.name} x${s.quantity} `;

    // Botão de remover item
    const rm = document.createElement('button');
    rm.textContent = 'Remover';
    rm.className = 'btn';
    rm.style.marginLeft = '8px';

    rm.addEventListener('click', () => {
      selected.splice(idx, 1);   // remove item da lista
      renderSelected();          // atualiza a exibição
    });

    li.appendChild(rm);
    ul.appendChild(li);
  });
}


// ------------------- SESSÃO -------------------
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
})();


