// Este arquivo cuida da inicialização e da navegação entre as telas

// Botões de navegação
document.getElementById('btnCatalog').addEventListener('click', ()=> showView('catalogView'));
document.getElementById('btnNewReserv').addEventListener('click', ()=> showView('newView'));
document.getElementById('btnReservations').addEventListener('click', ()=> showView('reservationsView'));

// Função que mostra a view escolhida e esconde as outras
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
  const view = document.getElementById(id);
  if (view) {
    view.classList.remove('hidden');
  }

  // Renderiza conteúdo específico de cada view
  if(id==='catalogView') renderCatalog();
  if(id==='reservationsView') renderReservations();
  if(id==='newView') {
    populateItemSelect();
    document.getElementById('selectedItems').innerHTML = '';
  }
}

// Botão para adicionar itens de exemplo no catálogo
document.getElementById('btnAddSample').addEventListener('click', ()=>{
  const sampleItems = [
    { id: 1, name: 'Canhão LED 1k', code: 'C-LED-1', total: 20 },
    { id: 2, name: 'Canhão Spot 500', code: 'C-SP-500', total: 10 },
    { id: 3, name: 'Par LED RGB', code: 'PAR-RGB', total: 30 }
  ];
  saveItems(sampleItems);
  renderCatalog();
  alert('Itens de exemplo adicionados');
});
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
// Lógica para adicionar itens à reserva
document.getElementById('addItemBtn').addEventListener('click', ()=>{
  const itemId = parseInt(document.getElementById('itemSelect').value,10);
  const qty = parseInt(document.getElementById('itemQty').value,10);
  const items = loadItems();
  const it = items.find(x=>x.id===itemId);

  if(!it){ alert('Item inválido'); return; }
  const date = document.querySelector('input[name="date"]').value;
  if(!date){ alert('Escolha a data do evento primeiro'); return; }

  const avail = availableForDate(itemId, date);
  if(qty > avail){ alert(`Disponível para ${date}: ${avail}`); return; }

  selected.push({ item_id: itemId, name: it.name, quantity: qty });
  renderSelected();
});

// Renderiza itens selecionados na reserva
function renderSelected(){
  const ul = document.getElementById('selectedItems');
  ul.innerHTML = '';
  selected.forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = `${s.name} x${s.quantity} `;
    const rm = document.createElement('button');
    rm.textContent='Remover';
    rm.className='btn';
    rm.style.marginLeft='8px';
    rm.addEventListener('click', ()=> { selected.splice(idx,1); renderSelected(); });
    li.appendChild(rm);
    ul.appendChild(li);
  });
}

// Submissão do formulário de reserva
document.getElementById('reservForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const client = e.target.client.value.trim();
  const location = e.target.location.value.trim();
  const date = e.target.date.value;

  if(!client || !location || !date || selected.length===0){
    alert('Preencha todos os campos e adicione ao menos 1 item');
    return;
  }

  // Verificação final de disponibilidade
  for(const s of selected){
    const avail = availableForDate(s.item_id, date);
    if(s.quantity > avail){
      alert(`Sem estoque suficiente para ${s.name} em ${date}. Disponível: ${avail}`);
      return;
    }
  }

  const reservations = loadReservations();
  const editingId = Number(e.target.getAttribute('data-editing-id') || 0);

  if(editingId){
    // Atualiza reserva existente
    const idx = reservations.findIndex(r => r.id === editingId);
    if(idx >= 0){
      const previousReservation = reservations[idx];
      adjustStockForReservation(previousReservation, 1);

      reservations[idx] = {
        ...previousReservation,
        client_name: client,
        location,
        event_date: date,
        items: selected.map(s=>({ item_id: s.item_id, name: s.name, quantity: s.quantity })),
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
      items: selected.map(s=>({ item_id: s.item_id, name: s.name, quantity: s.quantity })),
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
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Confirmar';

  showView('reservationsView');
});
