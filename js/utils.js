// utils.js

// ==========================================
// Função: formatarRespostaUsuario(tipo, selecionadas, questoes, index)
// Descrição: Formata a resposta do usuário para exibição
// ==========================================
export function formatarRespostaUsuario(tipo, selecionadas, questoes, index) {
  const q = questoes[index];
  if (tipo === "unica") {
    return q.opcoes[selecionadas[0]];
  } else if (tipo === "multipla") {
    return selecionadas.map(i => q.opcoes[i]).join("<p></p> ");
  } else if (tipo === "simnao") {
    return selecionadas.map((s, i) => `${q.afirmacoes[i]}: ${s ? '<strong>Sim.</strong><p></p>' : '<strong>Não.</strong><p></p>'}`).join("<br>");
  } else if (tipo === "dragdrop") {
    let respostaFormatada = "";
    for (const grupo in selecionadas) {
      respostaFormatada += `${grupo}: <strong>${selecionadas[grupo].join(", ")}</strong><p></p>`;
    }
    return respostaFormatada;
  } else if (tipo === "combobox") {
    return q.opcoes[selecionadas[0]];
  } else if (tipo === "comboboxs") {
    return selecionadas.map((valor, i) => {
      const texto = q.pares[i].opcoes[valor];
      return `• ${q.pares[i].requisito}: <strong>${texto}</strong>`;
    }).join('<p></p>');
  }
  return selecionadas;
}

// ==========================================
// Função: formatarRespostaCorreta(questao)
// Descrição: Formata a resposta correta para exibição
// ==========================================
export function formatarRespostaCorreta(questao) {
  if (questao.tipo === "unica") {
    return questao.opcoes[questao.resposta];
  } else if (questao.tipo === "multipla") {
    return questao.opcoes.filter((_, i) => questao.respostas.includes(i)).join("<p></p> ");
  } else if (questao.tipo === "simnao") {
    return questao.respostas.map((r, i) => `${questao.afirmacoes[i]}: ${r ? '<strong>Sim.</strong><p></p>' : '<strong>Não.</strong><p></p>'}`).join("<br>");
  } else if (questao.tipo === "dragdrop") {
    let respostaFormatada = "";
    for (const grupo in questao.respostas) {
      respostaFormatada += `${grupo}: <strong>${questao.respostas[grupo].join(", ")}</strong><p></p>`;
    }
    return respostaFormatada;
  } else if (questao.tipo === "combobox") {
    return questao.opcoes[questao.resposta];
  } else if (questao.tipo === "comboboxs") {
    return questao.pares.map(par => {
      return `• ${par.requisito}: <strong>${par.opcoes[par.resposta]}</strong>`;
    }).join('<p></p>');
  }
  return questao.respostas;
}

// ==========================================
// Função: verificarRespostas(q)
// Descrição: Verifica se todas as respostas foram selecionadas
// ==========================================
export function verificarRespostas(q) {
  let respostasNaoSelecionadas = false;

  if (q.tipo === "simnao") {
    q.afirmacoes.forEach((_, i) => {
      const selected = document.querySelector(`input[name='afirmacao_${i}']:checked`);
      if (!selected) respostasNaoSelecionadas = true;
    });
  } else if (q.tipo === "multipla") {
    const checkboxes = document.querySelectorAll("input[name='resposta']:checked");
    if (checkboxes.length === 0) respostasNaoSelecionadas = true;
  } else if (q.tipo === "unica") {
    const selected = document.querySelector("input[name='resposta']:checked");
    if (!selected) respostasNaoSelecionadas = true;
  } else if (q.tipo === "combobox") {
    const select = document.querySelector("select[name='resposta']");
    if (!select || select.selectedIndex === 0) {
      respostasNaoSelecionadas = true;
    }
  } else if (q.tipo === "dragdrop") {
    const zonas = document.querySelectorAll(".dropzone");
    const todasPreenchidas = Array.from(zonas).every(zona => zona.querySelector(".draggable"));
    if (!todasPreenchidas) respostasNaoSelecionadas = true;
  } else if (q.tipo === "comboboxs") {
    const selects = document.querySelectorAll("select[id^='combo-']");
    const todosPreenchidos = Array.from(selects).every(select => select.selectedIndex > 0);
    if (!todosPreenchidos) respostasNaoSelecionadas = true;
  }

  if (respostasNaoSelecionadas) {
    alert("⚠️ Você esqueceu de responder uma ou mais questões! Por favor, preencha todas as respostas antes de confirmar.");
    return false;
  }
  return true;
}

// ==========================================
// Função auxiliar para comboboxs
// ==========================================
export function verificarComboboxs(questao, respostasUsuario) {
  const corretas = questao.pares.map(par => par.resposta);
  return JSON.stringify(respostasUsuario) === JSON.stringify(corretas);
}
