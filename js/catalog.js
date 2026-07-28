// Este arquivo cuida da parte do catálogo de equipamentos

// Renderizar o catálogo na tela
function renderCatalog() {
    const list = document.getElementById("catalogList");
    if (!list) return;

    list.innerHTML = '';
    const items = loadItems();

    if (items.length === 0) {
        list.innerHTML = '<div class="card">Nenhum item cadastrado.</div>';
        return;
    }

    items.forEach(it => {
        const div = document.createElement('div');
        div.className = 'itemCard';
        div.innerHTML = `
            <h4>${it.name}</h4>
            <p>Código: ${it.code} • Total: ${it.total}</p>
            <div class="row">
                <button type="button" class="btn" data-edit-id="${it.id}">Editar</button>
                <button type="button" class="btn" data-remove-id="${it.id}">Remover</button>
            </div>
        `;
        list.appendChild(div);
    });

    list.querySelectorAll('[data-remove-id]').forEach(button => {
        button.addEventListener('click', () => {
            const idToRemove = Number(button.getAttribute('data-remove-id'));
            const updatedItems = loadItems().filter(item => item.id !== idToRemove);
            saveItems(updatedItems);
            renderCatalog();
            alert('Equipamento removido.');
        });
    });

    list.querySelectorAll('[data-edit-id]').forEach(button => {
        button.addEventListener('click', () => {
            const idToEdit = Number(button.getAttribute('data-edit-id'));
            const item = loadItems().find(item => item.id === idToEdit);
            if (!item) return;

            document.getElementById('equipmentName').value = item.name;
            document.getElementById('equipmentCode').value = item.code;
            document.getElementById('equipmentTotal').value = item.total;
            document.getElementById('equipmentId').value = item.id;

            const submitButton = addEquipmentForm?.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Salvar edição';
            }
        });
    });

    populateItemSelect();
}

// Preenche o select de itens no formulário de reserva
function populateItemSelect(){
  const sel = document.getElementById('itemSelect');
  if (!sel) return;

  sel.innerHTML = '';
  loadItems().forEach(it => {
    const opt = document.createElement('option');
    opt.value = it.id;
    opt.textContent = `${it.name} (Total ${it.total})`;
    sel.appendChild(opt);
  });
}

// Adiciona um novo equipamento ao catálogo
const addEquipmentForm = document.getElementById('addEquipmentForm');
if (addEquipmentForm) {
  addEquipmentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('equipmentName').value.trim();
    const code = document.getElementById('equipmentCode').value.trim();
    const total = parseInt(document.getElementById('equipmentTotal').value, 10);

    if (!name || !code || !total || total < 1) {
      alert('Preencha nome, código e quantidade válida.');
      return;
    }

    const items = loadItems();
    const editingId = Number(document.getElementById('equipmentId').value || 0);

    if (editingId) {
      const existingIndex = items.findIndex(item => item.id === editingId);
      if (existingIndex >= 0) {
        items[existingIndex] = { ...items[existingIndex], name, code, total };
      }
    } else {
      items.push({ id: Date.now(), name, code, total });
    }

    saveItems(items);
    addEquipmentForm.reset();
    renderCatalog();

    const submitButton = addEquipmentForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Adicionar ao catálogo';
    }

    alert(editingId ? 'Equipamento atualizado com sucesso.' : 'Equipamento adicionado com sucesso.');
  });
}