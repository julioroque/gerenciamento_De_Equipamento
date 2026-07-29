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
          Itens: ${r.items.map(i => `${i.name} x${i.quantity}`).join(', ')}<br/>
          <small>Criado em ${new Date(r.created_at).toLocaleString()}</small>
                    <div class="row">
                        ${currentUserRole === 'chefe' ? `
                            <button class="btn" data-edit-id="${r.id}">Editar reserva</button>
                            <button class="btn danger" data-remove-id="${r.id}">Remover</button>
                        ` : `
                            <button class="btn" data-edit-id="${r.id}">Editar reserva</button>
                        `}
                    </div>
        `;
        wrap.appendChild(div);
    });

    // Remover reserva (apenas chefe)
    if(currentUserRole === 'chefe'){
        wrap.querySelectorAll('[data-remove-id]').forEach(button => {
            button.addEventListener('click', () => {
                const idToRemove = Number(button.getAttribute('data-remove-id'));
                // Encontra a reserva e repõe o estoque antes de remover
                const reservationToRemove = loadReservations().find(reserva => reserva.id === idToRemove);
                if (reservationToRemove) {
                    try {
                        adjustStockForReservation(reservationToRemove, 1);
                    } catch (err) {
                        console.error('Erro ao repor estoque da reserva:', err);
                    }
                }

                const updatedRes = loadReservations().filter(reserva => reserva.id !== idToRemove);
                saveReservations(updatedRes);
                renderReservations();
                // Atualiza catálogo para refletir reposição
                if (typeof renderCatalog === 'function') renderCatalog();
                alert('Reserva removida com sucesso. Estoque atualizado.');
            });
        });
    }

    // Editar reserva (disponível para chefe e funcionário)
    wrap.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', () => {
            const idToEdit = Number(button.getAttribute('data-edit-id'));
            const reserva = loadReservations().find(r => r.id === idToEdit);
            if (!reserva) return;

            // Abre a view antes de popular o formulário (para não perder o DOM)
            showView('newView');

            const form = document.getElementById('reservForm');

            // Preenche campos básicos
            form.client.value = reserva.client_name;
            form.location.value = reserva.location;
            form.date.value = reserva.event_date;

            // Preenche itens
            selected = reserva.items.map(i => ({
                item_id: i.item_id,
                name: i.name,
                quantity: i.quantity
            }));
            renderSelected();

            form.setAttribute('data-editing-id', idToEdit);

            const submitBtn = form.querySelector('button[type="submit"]');

            if (currentUserRole === 'funcionario') {
                // Funcionário só pode editar itens: bloqueia cliente/local/data e muda texto
                form.client.disabled = true;
                form.location.disabled = true;
                form.date.disabled = true;
                if (submitBtn) submitBtn.textContent = 'Salvar equipamentos';
            } else {
                // Chefe pode editar tudo
                form.client.disabled = false;
                form.location.disabled = false;
                form.date.disabled = false;
                if (submitBtn) submitBtn.textContent = 'Salvar edição';
            }
        });
    });

    
}

// Função que calcula disponibilidade de um item para uma data
function availableForDate(itemId, date, excludeReservationId) {
    const items = loadItems();
    const it = items.find(x => x.id === itemId);
    if (!it) return 0;

    // Filtra reservas confirmadas para a mesma data, excetuando a reserva em edição
    const reservations = loadReservations().filter(r => r.event_date === date && r.status === 'confirmed' && r.id !== excludeReservationId);

    // Soma a quantidade já reservada desse item
    const reserved = reservations.reduce((sum, r) => {
        const ri = r.items.find(x => x.item_id === itemId);
        return sum + (ri ? ri.quantity : 0);
    }, 0);

    // Retorna o total disponível
    // Se estamos editando uma reserva, a quantidade dessa reserva já foi subtraída de `it.total`.
    // Precisamos somar de volta a quantidade da própria reserva para cálculo correto enquanto edita.
    let ownQty = 0;
    if (excludeReservationId) {
        const ownRes = loadReservations().find(r => r.id === excludeReservationId);
        if (ownRes && ownRes.event_date === date) {
            const ri = ownRes.items.find(x => x.item_id === itemId);
            ownQty = ri ? ri.quantity : 0;
        }
    }

    return it.total - reserved + ownQty;
}
