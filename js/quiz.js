// Função para emitir certificado em PDF (escopo global)
function emitirCertificado() {
  if (!window.jspdf) {
    alert('jsPDF não está disponível. Adicione a biblioteca jsPDF ao projeto.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [923, 656] });
  const img = new window.Image();
  img.src = 'img/template_certificado.jpg';
  img.onload = function() {
    doc.addImage(img, 'PNG', 0, 0, 923, 656);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(40, 60, 110);
    let nome = typeof nomeUsuario !== 'undefined' ? nomeUsuario : window.nomeUsuario;
    if (!nome || nome.length < 2) {
      nome = 'Nome não informado';
    }
    // Ajuste para o nome ficar acima da linha (exemplo: y=310)
    doc.text(String(nome), 462, 310, { align: 'center' });
    doc.save('certificado.pdf');
  };
  img.onerror = function() {
    alert('Não foi possível carregar a imagem do certificado. Verifique se o arquivo img/template_certificado.png existe e está acessível.');
    console.error('Erro ao carregar imagem:', img.src);
  };
}
// ==========================================
// Arquivo: quiz.js
// Descrição: Controle principal do Simulado SC-900
// ==========================================

import { questoes } from './questoes.js';
import { renderizarLista, renderizarQuestao } from './render.js';
import { iniciarCronometro, pararCronometro } from './timer.js';
import { formatarRespostaUsuario, formatarRespostaCorreta, verificarRespostas } from './utils.js';

// ==========================================
// Variáveis globais
// ==========================================

export let questaoAtual = 0;
export let respostasUsuario = [];
export const marcadas = new Set();
export let simuladoFinalizado = false;
export let nomeUsuario = ""; // Novo: guarda o nome do usuário

const inicioSimulado = new Date();

let resultadoFinalHTML = ""; // 📝 Guarda o HTML do Resultado Final para restaurar depois

export const listaQuestoes = document.getElementById("listaQuestoes");
const questaoContainer = document.getElementById("questaoContainer");
questaoContainer.innerHTML = "";

export const feedback = document.getElementById("feedback");
export const confirmarBtn = document.getElementById("confirmarBtn");
export const proximaBtn = document.getElementById("proximaBtn");
export const finalizarBtn = document.getElementById("finalizarBtn");
export const voltarBtn = document.getElementById("voltarBtn");
const resultadoFinal = document.getElementById("resultadoFinal");
export let resultadoFinalExibido = false;


// ==========================================
// Novo cálculo automático do VALOR_ACERTO
// ==========================================

let totalAcertosPossiveis = 0;


  questoes.forEach(q => {
    if (q.tipo === "unica" || q.tipo === "combobox" || q.tipo === "comboboxs") {        
        totalAcertosPossiveis += 1;
    } else if (q.tipo === "multipla") {
        totalAcertosPossiveis += q.respostas.length;
    } else if (q.tipo === "simnao") {
        totalAcertosPossiveis += q.respostas.length;
    } else if (q.tipo === "dragdrop") {
        totalAcertosPossiveis += Object.keys(q.respostas).length;
    }
});

const VALOR_ACERTO = 1000 / totalAcertosPossiveis;

// ==========================================
// Inicialização dos botões
// ==========================================

voltarBtn.classList.add("hidden");
proximaBtn.classList.add("hidden");
finalizarBtn.classList.add("hidden");

confirmarBtn.onclick = () => confirmarQuestao();
proximaBtn.onclick = () => proximaQuestao();
voltarBtn.onclick = () => voltarQuestao();
finalizarBtn.onclick = () => {
  if (!todasQuestoesRespondidas(questoes, respostasUsuario)) {
    mostrarConfirmacaoFinalizar();
  } else {
    finalizarSimulado();
  }
};

// Modal para solicitar nome do usuário antes de iniciar
function mostrarModalNomeUsuario() {
  let modal = document.createElement('div');
  modal.id = 'modalNomeUsuario';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:#fff;padding:30px;border-radius:8px;max-width:350px;text-align:center;">
      <h2>Informe seu nome completo para o certificado</h2>
      <input type="text" id="inputNomeUsuario" placeholder="Digite seu nome completo" style="width:90%;padding:10px;margin:15px 0;" />
      <br>
      <button id="btnConfirmarNomeUsuario" style="padding:10px 30px;">Iniciar Teste</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('btnConfirmarNomeUsuario').onclick = () => {
    const nome = document.getElementById('inputNomeUsuario').value.trim();
    if (!nome) {
      alert('Por favor, digite seu nome.');
      return;
    }
    nomeUsuario = nome;
    modal.remove();
    // Chama a função de inicialização do simulado
    if (window.iniciarSimulado) {
      window.iniciarSimulado();
    }
  };
}

// Exibe o modal ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  if (!nomeUsuario) {
    // Adia a inicialização do simulado até o nome ser informado
    if (typeof window.iniciarSimulado === 'function') {
      // Sobrescreve para não iniciar automaticamente
      window.iniciarSimulado = window.iniciarSimulado;
    }
    mostrarModalNomeUsuario();
  }
});

// ==========================================
// Função: marcarQuestao(index)
// Descrição: Marca ou desmarca uma questão na bandeira
// ==========================================

export function marcarQuestao(index) {
    if (marcadas.has(index)) {
        marcadas.delete(index);
    } else {
        marcadas.add(index);
    }
}

// ==========================================
// Função: setQuestaoAtual(index)
// Descrição: Atualiza o índice da questão atual
// ==========================================

export function setQuestaoAtual(index) {
    questaoAtual = index;
}

// ==========================================
// Função: confirmarQuestao()
// Descrição: Confirma a resposta da questão atual
// ==========================================

function confirmarQuestao() {
    const q = questoes[questaoAtual];
    if (!verificarRespostas(q)) return;

    if (q.tipo === "multipla") {
        const selecionadas = capturarResposta(q);
        if (selecionadas.length !== q.respostas.length) {
            alert(`⚠️ Você deve selecionar exatamente ${q.respostas.length} alternativas para confirmar essa questão.`);
            return;
        }
    }

    const resposta = capturarResposta(q);
    salvarResposta(q, resposta);
    mostrarFeedback(q, resposta);

    confirmarBtn.classList.add("hidden");

    if (questaoAtual < questoes.length - 1) {
        proximaBtn.classList.remove("hidden");
        finalizarBtn.classList.add("hidden");
    } else {
        proximaBtn.classList.add("hidden");
        finalizarBtn.classList.remove("hidden");
    }

    voltarBtn.classList.toggle("hidden", questaoAtual === 0);
}

// ==========================================
// Função: proximaQuestao()
// Descrição: Avança para a próxima questão
// ==========================================

function proximaQuestao() {
    if (questaoAtual < questoes.length - 1) {
        questaoAtual++;
        navegarQuestao();
    }
}

// ==========================================
// Função: voltarQuestao()
// Descrição: Retorna para a questão anterior
// ==========================================

function voltarQuestao() {
    if (questaoAtual > 0) {
        questaoAtual--;
        navegarQuestao();
    }
}

// ==========================================
// Função: atualizarBarraProgresso()
// Descrição: Atualiza o texto e largura da barra de progresso
// ==========================================
export function atualizarBarraProgresso() {
  const textoProgresso = document.getElementById('textoProgresso');
  const barra = document.getElementById('barraProgresso');

  if (!textoProgresso || !barra) return;

  const total = questoes.length;     // Total de questões
  const atual = questaoAtual + 1;     // Questão atual (começa do 0, por isso +1)
  const percentual = Math.round((atual / total) * 100);

  textoProgresso.textContent = `Pergunta ${atual} de ${total}`;
  barra.style.width = `${percentual}%`;
}



// ==========================================
// Função: navegarQuestao()
// Descrição: Atualiza a tela ao navegar entre questões
// ==========================================

function navegarQuestao() {
    renderizarLista(questoes);
    renderizarQuestao(questoes);
    atualizarBarraProgresso();

    const respostaSalva = respostasUsuario.find(r => r.index === questaoAtual);

    if (respostaSalva) {
        const q = questoes[questaoAtual];
        mostrarFeedback(q, respostaSalva.selecionadas);
        confirmarBtn.classList.add("hidden");

        if (questaoAtual < questoes.length - 1) {
            proximaBtn.classList.remove("hidden");
            finalizarBtn.classList.add("hidden");
        } else {
            proximaBtn.classList.add("hidden");
            finalizarBtn.classList.remove("hidden");
        }

    } else {
        feedback.classList.add("hidden");
        confirmarBtn.classList.remove("hidden");
        proximaBtn.classList.add("hidden");
        finalizarBtn.classList.add("hidden");
    }

    voltarBtn.classList.toggle("hidden", questaoAtual === 0);

    
}

// ==========================================
// Função: finalizarSimulado()
// Descrição: Finaliza o simulado e mostra o resultado
// ==========================================

function finalizarSimulado() {
    pararCronometro();
    simuladoFinalizado = true; // ⚡ Marca que finalizou
    mostrarResultadoFinal();
}

// ==========================================
// Função: capturarResposta(q)
// Descrição: Captura a resposta do usuário
// ==========================================

function capturarResposta(q) {
    if (q.tipo === "unica") {
        const input = document.querySelector("input[name='resposta']:checked");
        return input ? [parseInt(input.value)] : [];
    }
    if (q.tipo === "multipla") {
        return Array.from(document.querySelectorAll("input[name='resposta']:checked")).map(e => parseInt(e.value));
    }
    if (q.tipo === "simnao") {
        return q.afirmacoes.map((_, i) => {
            const input = document.querySelector(`input[name='afirmacao_${i}']:checked`);
            return input ? input.value === "true" : null;
        });
    }
    if (q.tipo === "combobox") {
        const select = document.querySelector("select[name='resposta']");
        return select ? [parseInt(select.value)] : [];
    }
    if (q.tipo === "dragdrop") {
        const zonas = document.querySelectorAll(".dropzone");
        const respostaDragDrop = {};
        zonas.forEach(zona => {
            const grupo = zona.dataset.grupo;
            const itens = Array.from(zona.querySelectorAll(".draggable")).map(e => e.dataset.value);
            respostaDragDrop[grupo] = itens;
        });
        return respostaDragDrop;
    }
    if (q.tipo === "comboboxs") {
      const selects = document.querySelectorAll("select[id^='combo-']");
      return Array.from(selects).map(s => parseInt(s.value));
  }
  
    return [];
}

// ==========================================
// Função: salvarResposta(q, selecionadas)
// Descrição: Salva a resposta do usuário
// ==========================================

function salvarResposta(q, selecionadas) {
    let pontosQuestao = 0;

    if (q.tipo === "unica" || q.tipo === "combobox") {
        if (selecionadas[0] === q.resposta) {
            pontosQuestao = VALOR_ACERTO;
        }
    } else if (q.tipo === "multipla") {
        selecionadas.forEach(i => {
            if (q.respostas.includes(i)) {
                pontosQuestao += VALOR_ACERTO;
            }
        });
    } else if (q.tipo === "simnao") {
        selecionadas.forEach((resp, i) => {
            if (resp === q.respostas[i]) {
                pontosQuestao += VALOR_ACERTO;
            }
        });
    } else if (q.tipo === "dragdrop") {
        for (const grupo in q.respostas) {
            const respostaCorreta = q.respostas[grupo];
            const respostaUsuarioGrupo = selecionadas[grupo] || [];
            if (JSON.stringify(respostaCorreta.sort()) === JSON.stringify(respostaUsuarioGrupo.sort())) {
                pontosQuestao += VALOR_ACERTO;
            }
        }
    } else if (q.tipo === "comboboxs") {
        const corretas = q.pares.map(p => p.resposta);
        const corretasRespondidas = selecionadas.filter((resposta, i) => resposta === corretas[i]);
        pontosQuestao = VALOR_ACERTO * (corretasRespondidas.length / corretas.length);
    }

    const index = respostasUsuario.findIndex(resp => resp.index === questaoAtual);
    if (index > -1) {
        respostasUsuario[index] = { index: questaoAtual, selecionadas, pontos: pontosQuestao }; // sem Math.round
    } else {
        respostasUsuario.push({ index: questaoAtual, selecionadas, pontos: pontosQuestao }); // sem Math.round
    }
}

// ==========================================
// Função: mostrarFeedback(q, respostaUsuario)
// Descrição: Exibe o feedback da questão
// ==========================================

export function mostrarFeedback(q, respostaUsuario) {
  const respostaCorretaFormatada = formatarRespostaCorreta(q);
  const respostaUsuarioFormatada = formatarRespostaUsuario(q.tipo, respostaUsuario, questoes, questaoAtual);

  let feedbackClass = "incorrect";

  if (q.tipo === "unica" || q.tipo === "combobox") {
      feedbackClass = respostaUsuario[0] === q.resposta ? "correct" : "incorrect";
  } else if (q.tipo === "multipla") {
      const corretas = q.respostas;
      const acertadas = respostaUsuario.filter(r => corretas.includes(r));
      if (acertadas.length === corretas.length && respostaUsuario.length === corretas.length) {
          feedbackClass = "correct";
      } else if (acertadas.length > 0) {
          feedbackClass = "partial";
      }
  } else if (q.tipo === "simnao") {
      let corretas = 0;
      respostaUsuario.forEach((r, i) => {
          if (r === q.respostas[i]) corretas++;
      });
      if (corretas === q.respostas.length) {
          feedbackClass = "correct";
      } else if (corretas > 0) {
          feedbackClass = "partial";
      }
  } else if (q.tipo === "dragdrop") {
      let corretas = 0;
      for (const grupo in q.respostas) {
          const respostaCorreta = q.respostas[grupo];
          const respostaUsuarioGrupo = respostaUsuario[grupo] || [];
          if (JSON.stringify(respostaCorreta.sort()) === JSON.stringify(respostaUsuarioGrupo.sort())) {
              corretas++;
          }
      }
      if (corretas === Object.keys(q.respostas).length) {
          feedbackClass = "correct";
      } else if (corretas > 0) {
          feedbackClass = "partial";
      }
  } else if (q.tipo === "comboboxs") {
      const corretas = q.pares.map(p => p.resposta);
      let corretasRespondidas = 0;
      respostaUsuario.forEach((resp, i) => {
          if (resp === corretas[i]) corretasRespondidas++;
      });
      if (corretasRespondidas === corretas.length) {
          feedbackClass = "correct";
      } else if (corretasRespondidas > 0) {
          feedbackClass = "partial";
      }
  }

  const respostaUsuarioFormatadaComMoldura = respostaUsuarioFormatada
  .split(/(?<=[])\s+(?=[✔️❌•➡️A-ZÀ-Ú])/)
  .map(frase => `<div class="feedback-borda"><p>${frase.trim().replace(/[.?!]$/, '')}.</p></div>`)
  .filter(linha => linha.trim() !== '')
  .join('');

  const respostaCorretaFormatadaComMoldura = respostaCorretaFormatada
  .split(/(?<=[])\s+(?=[✔️❌•➡️A-ZÀ-Ú])/)
  .map(frase => `<div class="feedback-borda"><p>${frase.trim().replace(/[.?!]$/, '')}.</p></div>`)
  .filter(linha => linha.trim() !== '')
  .join('');

  
  const explicacaoTexto = (q.explicacao ?? "").toString().replace(/\n+/g, ' ').trim();

  const explicacaoFormatadaComMoldura = explicacaoTexto
      .split(/(?<=[.?!])\s+(?=[✔️❌•➡️A-ZÀ-Ú])/)
      .map(frase => `<p>${frase.trim().replace(/[.?!]$/, '')}.</p>`)
      .filter(linha => linha.trim() !== '')
      //.map(item => `<div class="feedback-borda"><span>${item.trim()}</span></div>`)
      .join('');
      
      

  feedback.innerHTML = `
      <div><strong>Você respondeu:</strong><div>${respostaUsuarioFormatadaComMoldura}</div></div><br>
      <div><strong>Resposta correta:</strong><div>${respostaCorretaFormatadaComMoldura}</div></div><br>
      <div><strong>Explicação:</strong><div>${explicacaoFormatadaComMoldura}</div></div>
      <p><strong>Referência:</strong> <a href="${q.link}" target="_blank">Microsoft Learning</a></p>
      <p><strong>Domínio:</strong> ${q.dominio}</p>
  `;

  feedback.className = `feedback ${feedbackClass}`;
  feedback.classList.remove("hidden");
}


// ==========================================
// Função: mostrarResultadoFinal()
// Descrição: Exibe o resultado final
// ==========================================

function mostrarResultadoFinal() {
  if (resultadoFinalExibido) return;

  pararCronometro();
  simuladoFinalizado = true;
  resultadoFinalExibido = true;

  feedback.classList.add("hidden");
  confirmarBtn.disabled = true;
  confirmarBtn.classList.add("hidden");
  finalizarBtn.classList.add("hidden");
  proximaBtn.classList.add("hidden");
  voltarBtn.classList.add("hidden");

  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.style.display = "none";
  // Oculta a sidebar direita
  const sidebarDireita = document.querySelector(".sidebarDireita");
  if (sidebarDireita) sidebarDireita.style.display = "none";
  const container = document.querySelector(".container");
  if (container) container.style.justifyContent = "center";

  const quiz = document.getElementById("quiz");
  quiz.innerHTML = ""; // Limpa o quiz para mostrar só o resultado


  const resultado = document.createElement('div');
  resultado.className = "resultado-final";

  const tempoDecorrido = calcularTempoDecorrido();
  const pontuacaoTotal = calcularPontuacao();

  const percentual = Math.round((pontuacaoTotal / 1000) * 100);

  resultado.innerHTML = `
    <center><h1>Resultado Final</h1>
    <h2>${percentual}% de acertos</h2>
    <p><strong>Pontuação:</strong> ${pontuacaoTotal} de 1000 pontos</p>
    <p><strong>Tempo decorrido:</strong> ${tempoDecorrido} minutos</p>

    <canvas id="graficoResultado" style="margin-top:20px;"></canvas>
    <h1>Desempenho por seção do simulado</h1>
    <canvas id="graficoDominio" style="margin-top:40px;"></canvas>

    <div style="margin-top: 30px; display: flex; justify-content: center; gap: 10px;">
      <button id="refazerBtn" class="btn-reiniciar">Refazer Simulado</button>
      <button id="revisarBtn" class="btn-revisar">Revisar Questões</button>
      <button id="emitirCertificadoBtn" class="btn-reiniciar">Emitir Certificado</button>
    </div></center>
  `;

  quiz.appendChild(resultado);

  resultadoFinalHTML = quiz.innerHTML; // 📝 Salva o Resultado Final gerado (com gráficos)


  // 🛠️ ⚡ IMPORTANTE: Esperar o navegador pintar o HTML
  setTimeout(() => {
    desenharGraficos();
  }, 100);

  // Botões
  document.getElementById('refazerBtn').onclick = refazerSimulado;
  document.getElementById('revisarBtn').onclick = revisarQuestoes;
  document.getElementById('emitirCertificadoBtn').onclick = emitirCertificado;
  

  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  if (toggleSidebarBtn) toggleSidebarBtn.style.display = 'none';

  const progressoContainer = document.getElementById('progressoContainer');
  if (progressoContainer) progressoContainer.style.display = 'none';
}


// ==========================================
// Função: desenharGraficos()
// Descrição: Gera os gráficos de resultado final
//             - Gráfico de Pizza: Correto x Incorreto
//             - Gráfico de Barras: Pontuação por Domínio
//             - Utiliza Chart.js para renderizar os gráficos
// ==========================================
function desenharGraficos() {
  // Gráfico de pizza (pontuação geral)
  const ctxResultado = document.getElementById('graficoResultado').getContext('2d');
  const pontosObtidos = calcularPontuacao();
  const pontosRestantes = 1000 - pontosObtidos;

  new Chart(ctxResultado, {
    type: 'doughnut',
    data: {
      labels: ['Percentual de acerto', 'Percentual de erros'],
      datasets: [{
        data: [pontosObtidos, pontosRestantes],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Gráfico de barras (pontuação por domínio)
  const ctxDominio = document.getElementById('graficoDominio').getContext('2d');

  const dominios = {}; // Inicializa contador de pontos por domínio

  respostasUsuario.forEach(r => {
    const q = questoes[r.index];
    if (!dominios[q.dominio]) {
      dominios[q.dominio] = 0;
    }
    dominios[q.dominio] += r.pontos || 0;
  });

  const labels = Object.keys(dominios);
  const dados = Object.values(dominios);

  new Chart(ctxDominio, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pontuação por Domínio',
        data: dados,
        backgroundColor: '#007bff'
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 1000
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}





// ==========================================
// Função: refazerSimulado()
// Descrição: Reseta o simulado completamente
// ==========================================
function refazerSimulado() {
  const progressoContainer = document.getElementById('progressoContainer');
  if (progressoContainer) progressoContainer.style.display = '';
  location.reload();
}

// ==========================================
// Função: revisarQuestoes()
// Descrição: Permite revisar todas as questões com feedback colorido
// ==========================================
function revisarQuestoes() {
  const quiz = document.getElementById("quiz");
  quiz.className = "revisao-questoes";
  quiz.innerHTML = `
    <div style="text-align:center; margin-top:30px;">
      
    </div>
    <h2>Revisão de Questões</h2>
  `;

  questoes.forEach((q, index) => {
    const respostaSalva = respostasUsuario.find(r => r.index === index);
  
    if (!respostaSalva) return;
  
    // Cria novo feedback igual ao confirmar
    const respostaCorretaFormatada = formatarRespostaCorreta(q);
    const respostaUsuarioFormatada = formatarRespostaUsuario(q.tipo, respostaSalva.selecionadas, questoes, index);
  
    let feedbackClass = "incorrect";
  
    if (q.tipo === "unica" || q.tipo === "combobox") {
      feedbackClass = respostaSalva.selecionadas[0] === q.resposta ? "correct" : "incorrect";
    } else if (q.tipo === "multipla") {
      const corretas = q.respostas;
      const acertadas = respostaSalva.selecionadas.filter(r => corretas.includes(r));
      if (acertadas.length === corretas.length && respostaSalva.selecionadas.length === corretas.length) {
        feedbackClass = "correct";
      } else if (acertadas.length > 0) {
        feedbackClass = "partial";
      }
    } else if (q.tipo === "simnao") {
      let corretas = 0;
      respostaSalva.selecionadas.forEach((r, i) => {
        if (r === q.respostas[i]) corretas++;
      });
      if (corretas === q.respostas.length) {
        feedbackClass = "correct";
      } else if (corretas > 0) {
        feedbackClass = "partial";
      }
    } else if (q.tipo === "dragdrop") {
      let corretas = 0;
      for (const grupo in q.respostas) {
        const respostaCorreta = q.respostas[grupo];
        const respostaUsuarioGrupo = respostaSalva.selecionadas[grupo] || [];
        if (JSON.stringify(respostaCorreta.sort()) === JSON.stringify(respostaUsuarioGrupo.sort())) {
          corretas++;
        }
      }
      if (corretas === Object.keys(q.respostas).length) {
        feedbackClass = "correct";
      } else if (corretas > 0) {
        feedbackClass = "partial";
      }
    } else if (q.tipo === "comboboxs") {
      const corretas = q.pares.map(p => p.resposta);
      let corretasRespondidas = 0;
      respostaSalva.selecionadas.forEach((resp, i) => {
        if (resp === corretas[i]) corretasRespondidas++;
      });
      if (corretasRespondidas === corretas.length) {
        feedbackClass = "correct";
      } else if (corretasRespondidas > 0) {
        feedbackClass = "partial";
      }
    }
    
  
    const respostaUsuarioFormatadaComMoldura = respostaUsuarioFormatada
      .split('<br>')
      .filter(linha => linha.trim() !== '')
      .map(item => `<div class="feedback-borda"><span>${item.trim()}</span></div>`)
      .join('');
  
    const respostaCorretaFormatadaComMoldura = respostaCorretaFormatada
      .split('<br>')
      .filter(linha => linha.trim() !== '')
      .map(item => `<div class="feedback-borda"><span>${item.trim()}</span></div>`)
      .join('');
  
    const feedback = document.createElement("div");
    feedback.className = `feedback ${feedbackClass}`;

  const explicacaoTexto = (q.explicacao ?? "").toString().replace(/\n+/g, ' ').trim();

  const explicacaoFormatadaComMoldura = explicacaoTexto
      .split(/(?<=[.?!])\s+(?=[✔️❌•➡️A-ZÀ-Ú])/)
      .map(frase => `<p>${frase.trim().replace(/[.?!]$/, '')}.</p>`)
      .filter(linha => linha.trim() !== '')
      //.map(item => `<div class="feedback-borda"><span>${item.trim()}</span></div>`)
      .join('');
  
    feedback.innerHTML = `
  <div><p><h3>Questão ${index + 1}</h3></p></div>
  <div><p>Pergunta: ${q.texto}</p></div>
  <div><strong>Você respondeu:</strong><div>${respostaUsuarioFormatadaComMoldura}</div></div><br>
  <div><strong>Resposta correta:</strong><div>${respostaCorretaFormatadaComMoldura}</div></div><br>
  <div><strong>Explicação:</strong><p>${explicacaoFormatadaComMoldura}</p></div>
  <p><strong>Referência:</strong> <a href="${q.link}" target="_blank">Microsoft Learning</a></p>
  <p><strong>Domínio:</strong> ${q.dominio}</p>
`;  
    quiz.appendChild(feedback);
  });  

  const botoesContainer = document.createElement('div');
  botoesContainer.className = 'botoes-revisao';

  botoesContainer.innerHTML = `
    <button id="refazerBtn" class="btn-reiniciar">Refazer Simulado</button>
    <button id="voltarResultadoBtn" class="btn-revisar">Voltar Resultado Final</button>
    
  `;

  // Criação do botão "Imprimir em PDF"
  const imprimirBtn = document.createElement('button');
  imprimirBtn.textContent = 'Imprimir em PDF';
  imprimirBtn.id = 'btnImprimirPDF';
  imprimirBtn.className = 'btn-reiniciar'; // ou 'btn-revisar', conforme o padrão dos outros
  imprimirBtn.style.background = '#e53935'; // vermelho
  imprimirBtn.style.color = '#fff';
  imprimirBtn.onclick = () => window.print();

  // Adicione o botão ao container dos botões de ação da revisão
  botoesContainer.appendChild(imprimirBtn);

  // Adicione o container ao final do quiz
  quiz.appendChild(botoesContainer);

  // Eventos
  document.getElementById('refazerBtn').onclick = refazerSimulado;
  document.getElementById('voltarResultadoBtn').onclick = voltarResultadoFinal;
  document.getElementById('emitirCertificadoBtn').onclick = emitirCertificado;

// Função para emitir certificado em PDF
function emitirCertificado() {
  // Usa jsPDF para gerar PDF com imagem de fundo e nome do usuário
  // Requer que jsPDF e html2canvas estejam incluídos no projeto
  if (!window.jspdf) {
    alert('jsPDF não está disponível. Adicione a biblioteca jsPDF ao projeto.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [923, 656] });

  // Adiciona imagem de fundo
  const img = new Image();
  img.src = 'img/template_certificado.png';
  img.onload = function() {
    doc.addImage(img, 'PNG', 0, 0, 923, 656);
    // Adiciona nome do usuário
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(40, 60, 110);
    // Posição aproximada para o nome (ajuste conforme template)
    doc.text(nomeUsuario, 462, 260, { align: 'center' });
    doc.save('certificado.pdf');
  };
  img.onerror = function() {
    alert('Não foi possível carregar a imagem do certificado.');
  };
}
}

function voltarResultadoFinal() {
  const quiz = document.getElementById("quiz");
  quiz.innerHTML = resultadoFinalHTML; // 🛠️ Restaura o Resultado Final salvo

  // Reatribui eventos
  document.getElementById('refazerBtn').onclick = refazerSimulado;
  document.getElementById('revisarBtn').onclick = revisarQuestoes;

  // Redesenha os gráficos
  setTimeout(() => {
    desenharGraficos();
  }, 50);

  // 🛠️ Corrige layout dos botões
  const refazerBtn = document.getElementById('refazerBtn');
  const revisarBtn = document.getElementById('revisarBtn');

  // Cria novo container flexível
  const botoesContainer = document.createElement('div');
  botoesContainer.className = 'botoes-resultado-final'; // Aplicando a nova classe padrão

  botoesContainer.appendChild(refazerBtn);
  botoesContainer.appendChild(revisarBtn);

  const botaoContainerAntigo = document.querySelector('center > div');
  if (botaoContainerAntigo) botaoContainerAntigo.remove();

  const resultadoFinalDiv = document.querySelector('.resultado-final center');
  resultadoFinalDiv.appendChild(botoesContainer);
}

// Permite navegação direta ao clicar na lista lateral
export function irParaQuestao(index) {
  questaoAtual = index;
  navegarQuestao();
}

// ==========================================
// Função: calcularTempoDecorrido()
// Descrição: Calcula o tempo de duração
// ==========================================

function calcularTempoDecorrido() {
    const fim = new Date();
    return Math.floor((fim - inicioSimulado) / 60000);
}

// ==========================================
// Função: calcularPontuacao()
// Descrição: Soma a pontuação final
// ==========================================

function calcularPontuacao() {
    return Math.round(respostasUsuario.reduce((total, r) => total + (r.pontos || 0), 0));
}

// ==========================================
// Estilo para impressão
// ==========================================
const stylePrint = document.createElement('style');
stylePrint.innerHTML = `
@media print {
  .botoes-revisao,
  .botoes-resultado-final,
  .btn-imprimir,
  .btn-reiniciar,
  .btn-revisar,
  #refazerBtn,
  #voltarResultadoBtn,
  #btnImprimirPDF {
    display: none !important;
  }
}
`;
document.head.appendChild(stylePrint);

const stylePrintBtn = document.createElement('style');
stylePrintBtn.innerHTML = `
  #btnImprimirPDF, .btn-imprimir {
    background: #e53935 !important;
    color: #fff !important;
    border: none !important;
    transition: background 0.2s;
  }
  #btnImprimirPDF:hover, .btn-imprimir:hover {
    background: #b71c1c !important;
  }
`;
document.head.appendChild(stylePrintBtn);

// ==========================================
// Função: todasQuestoesRespondidas(questoes, respostasUsuario)
// Descrição: Verifica se todas as questões foram respondidas
// ==========================================
export function todasQuestoesRespondidas(questoes, respostasUsuario) {
  return questoes.length === respostasUsuario.length;
}

// ==========================================
// Função: mostrarConfirmacaoFinalizar()
// Descrição: Mostra uma confirmação antes de finalizar o simulado
// ==========================================
function mostrarConfirmacaoFinalizar() {
  // Crie o modal se não existir
  let modal = document.getElementById('modalFinalizar');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalFinalizar';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
      <div style="background:#fff;padding:30px;border-radius:8px;max-width:350px;text-align:center;">
        <p>Você não respondeu todas as questões.<br>Deseja finalizar mesmo assim?</p>
        <button id="btnConfirmarFinalizar" style="margin:10px 20px 0 0;">Confirmar</button>
        <button id="btnCancelarFinalizar">Cancelar</button>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }

  document.getElementById('btnConfirmarFinalizar').onclick = () => {
    modal.style.display = 'none';
    finalizarSimulado();
  };
  document.getElementById('btnCancelarFinalizar').onclick = () => {
    modal.style.display = 'none';
  };
}
