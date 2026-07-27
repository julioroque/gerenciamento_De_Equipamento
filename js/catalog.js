// Este arquivo cuida da parte do catálogo de equipamentos

// Renderizar o catalogo na tela
function renderCatalog() {
    const List = document.getElementById("cataloglist");
    List.innerHTML = '';
    const items = loadItems();

//se nao houver itens cadastrados
if (intems.length === 0) {
    List.innerHTML = '<div class="card">Nenhum item cadastrado.</div>';
    return;
}

//para cada item criar um card na tela
items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'itemCard';
    div.innerHTML = `<h4>${it.name}</h4><p>Código: ${it.code} • Total: ${it.total}</p>`;
    list.appendChild(div);
});
//atualizar o select de itens no formulario de reserva
populateItemSelect();
}
// Preenche o select de itens no formulário de reserva
function populateItemSelect(){
  const sel = document.getElementById('itemSelect');
  sel.innerHTML = '';
  loadItems().forEach(it => {
    const opt = document.createElement('option');
    opt.value = it.id;
    opt.textContent = `${it.name} (Total ${it.total})`;
    sel.appendChild(opt);
  });
}