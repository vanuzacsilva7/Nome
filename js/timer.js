// ==========================================
// Arquivo: timer.js
// Descrição: Gerencia o cronômetro do simulado
// ==========================================

let tempoRestante = 45 * 60; // 45 minutos em segundos
let intervaloCronometro;
let alerta15MinutosExibido = false;

// ==========================================
// Função: iniciarCronometro()
// Descrição: Inicia o cronômetro e atualiza a cada segundo
// ==========================================
export function iniciarCronometro() {
  const cronometroDiv = document.createElement("div");
  cronometroDiv.id = "cronometroContainer";
  cronometroDiv.style.position = "fixed";
  cronometroDiv.style.top = "0";
  cronometroDiv.style.left = "0";
  cronometroDiv.style.width = "100%";
  cronometroDiv.style.backgroundColor = "#000";
  cronometroDiv.style.color = "#fff";
  cronometroDiv.style.padding = "10px";
  cronometroDiv.style.textAlign = "center";
  cronometroDiv.style.fontSize = "24px";
  cronometroDiv.style.zIndex = "9999";
  cronometroDiv.innerHTML = "⏳ Tempo restante: <span id='cronometro'>45:00</span>";
  document.body.prepend(cronometroDiv);

  const cronometroElemento = document.getElementById("cronometro");

  intervaloCronometro = setInterval(() => {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    cronometroElemento.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    if (tempoRestante === 900 && !alerta15MinutosExibido) { // 15 minutos restantes
      alerta15MinutosExibido = true;
      exibirAlerta("⏰ Atenção: faltam apenas 15 minutos para o término!");
    }

    if (tempoRestante <= 0) {
      clearInterval(intervaloCronometro);
      exibirAlerta("⛔ Tempo esgotado! Simulado encerrado.");
      desativarInputs();
    }

    tempoRestante--;
  }, 1000);
}

// ==========================================
// Função: pararCronometro()
// Descrição: Para o cronômetro manualmente
// ==========================================
export function pararCronometro() {
  clearInterval(intervaloCronometro);
}

// ==========================================
// Função: exibirAlerta(mensagem)
// Descrição: Exibe um alerta personalizado no centro da tela
// ==========================================
function exibirAlerta(mensagem) {
  const alerta = document.createElement("div");
  alerta.style.position = "fixed";
  alerta.style.top = "50%";
  alerta.style.left = "50%";
  alerta.style.transform = "translate(-50%, -50%)";
  alerta.style.backgroundColor = "#fff";
  alerta.style.padding = "20px";
  alerta.style.border = "2px solid #000";
  alerta.style.zIndex = "10000";
  alerta.innerHTML = `<p>${mensagem}</p><button id='fecharAlerta'>Continuar</button>`;
  document.body.appendChild(alerta);

  const fecharBtn = document.getElementById('fecharAlerta');
  if (fecharBtn) fecharBtn.onclick = () => alerta.remove();
}

// ==========================================
// Função: desativarInputs()
// Descrição: Desativa todos os inputs e botões ao final do tempo
// ==========================================
function desativarInputs() {
  document.querySelectorAll("input, button").forEach(el => {
    if (el.id !== "reiniciarBtn") {
      el.disabled = false;
    }
  });
}
