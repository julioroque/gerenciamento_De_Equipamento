// Este arquivo cuida da parte da reserva

// Array temporário para guardar itens selecionados na reserva
let selected = [];

// Renderizar todas as reservas salvas
function renderReservations() {
    const wrap = document.getElementById('reservationsList');
    if (!wrap) return;

    wrap.innerHTML = '';
    const res = loadReservations();

    if (res.length === 0) {
        wrap.innerHTML = '<div class="card">Nenhuma reserva registrada.</div>';
        return;
    }

    res.forEach((r) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <strong>${r.client_name}</strong> — ${r.location} — ${r.event_date}<br/>
          Itens: ${r.items.map(i=>`${i.name} x${i.quantity}`).join(', ')}<br/>
          <small>Criado em ${new Date(r.created_at).toLocaleString()}</small>
          <div class="row">
            <button class="btn" data-edit-id="${r.id}">Editar</button>
            <button class="btn danger" data-remove-id="${r.id}">Remover</button>
          </div>
        `;
        wrap.appendChild(div);
    });

    // Evento para remover reserva
    wrap.querySelectorAll('[data-remove-id]').forEach(button => {
        button.addEventListener('click', () => {
            const idToRemove = Number(button.getAttribute('data-remove-id'));
            const updatedRes = loadReservations().filter(reserva => reserva.id !== idToRemove);
            saveReservations(updatedRes);
            renderReservations();
            alert('Reserva removida com sucesso.');
        });
    });

    // Evento para editar reserva
    wrap.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', () => {
            const idToEdit = Number(button.getAttribute('data-edit-id'));
            const reserva = loadReservations().find(r => r.id === idToEdit);
            if (!reserva) return;

            // Preenche o formulário com os dados da reserva
            const form = document.getElementById('reservForm');
            form.client.value = reserva.client_name;
            form.location.value = reserva.location;
            form.date.value = reserva.event_date;

            // Preenche itens selecionados
            selected = reserva.items.map(i => ({
                item_id: i.item_id,
                name: i.name,
                quantity: i.quantity
            }));
            renderSelected();

            // Guarda o ID da reserva em edição
            form.setAttribute('data-editing-id', idToEdit);

            // Muda o texto do botão de submit
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Salvar edição';

            // Mostra a view de edição
            showView('newView');
        });
    });
}

// Função que calcula disponibilidade de um item para uma data
function availableForDate(itemId, date){
  const items = loadItems();
  const it = items.find(x=>x.id===itemId);
  if(!it) return 0;

  return it.total;
}
