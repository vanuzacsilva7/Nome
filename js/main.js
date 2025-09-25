// ==========================================
// Arquivo: main.js
// Descrição: Inicializa o simulado, cronômetro e renderiza a primeira questão
// ==========================================

// Importações dos módulos principais
import { renderizarLista, renderizarQuestao } from './render.js';
import { iniciarCronometro } from './timer.js';
import { questoes } from './questoes.js';
import { atualizarBarraProgresso } from './quiz.js';
import { inicializarModalProblema } from './render.js';

// ==========================================
// Função: iniciarSimulado()
// Descrição: Função principal que inicia o simulado
// ==========================================
function iniciarSimulado() {
  renderizarLista(questoes);
  renderizarQuestao(questoes);
  iniciarCronometro();  
  atualizarBarraProgresso();
  inicializarModalProblema(); // 🛠 Inicializa botões do modal
}

// Chamada imediata para iniciar o simulado ao carregar a página
iniciarSimulado();
