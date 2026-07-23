
// Este arquivo cuida apenas do armazenamento local (localStorage)

// Chaves usadas no localStorage para salvar itens e reservas
const STORAGE = {
    ITEMS: 'pront_items_v1', // catálogo de equipamentos
    RES: 'pront_reservations_v1', // reservas feitas
}
// Função para carregar itens do localStorage
function loadItems() {
    const raw  = localStorage.getItem(STORAGE.ITEMS);
    return raw ? JSON.parse(raw) : []; // retorna array ou vazio
}
// Função para salvar itens no localStorage
function saveItems(items) { 
    localStorage.setItem(STORAGE.ITEMS, JSON.stringify(items));
}
// Função para carregar reservas do localStorage
function loadReservations() {
    const raw = localStorage.getItem(STORAGE.RES);
    return raw ? JSON.parse(raw) : []; // retorna array ou vazio
}
// Função para salvar reservas no localStorage
function saveReservations(reservations) {
    localStorage.setItem(STORAGE.RES, JSON.stringify(reservations));
}