// ==========================================
// Arquivo: questoes.js
// Descrição: Contém todas as questões do simulado AZ-900
// ==========================================

export const questoes = [

  
  // Questao 01
  {
    "tipo": "multipla",
    "texto": "No modelo de serviço de nuvem IaaS (infraestrutura como serviço), quais são os dois componentes que são responsabilidade do provedor de serviços de nuvem? Cada resposta correta apresenta uma solução completa.",
    "opcoes": [
      "a configuração da rede",
      "a instalação e configuração do sistema operacional",
      "a manutenção do hardware",
      "a segurança física da infraestrutura do datacenter",
      "a configuração e manutenção do armazenamento"
    ],
    "respostas": [2, 3],
    "explicacao": "No modelo IaaS, o provedor de nuvem é responsável pela infraestrutura subjacente, incluindo manutenção do hardware e segurança física do datacenter. O cliente é responsável pelo sistema operacional, aplicações, rede e dados.",
    "link": "https://learn.microsoft.com/pt-br/azure/security/fundamentals/shared-responsibility",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  },
    // Questao 02
  {
    "tipo": "combobox",
    "texto": "Selecione a resposta que completa a frase corretamente: Os serviços do Azure China <combobox>.",
    "opcoes": [
      "Selecione uma resposta",
      "são operados pela Microsoft.",
      "têm paridade de recurso com o Azure global.",
      "só podem ser acessados na China.",
      "compõem uma instância separada diferente do Microsoft Azure."
    ],
    "resposta": 4,
    "explicacao": "Os serviços do Azure China são operados por um provedor local autorizado e constituem uma instância separada do Azure global. Essa separação é exigida por regulamentos chineses para serviços em nuvem.",
    "link": "https://learn.microsoft.com/pt-br/azure/china/overview-operations",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  },
    // Questao 03
  {
    "tipo": "simnao",
    "texto": "Para cada uma das afirmações a seguir, selecione Sim se a afirmação for verdadeira. Caso contrário, selecione Não.",
    "afirmacoes": [
      "O preço de pagamento conforme o uso do Azure é um exemplo de CapEx.",
      "Pagar pela energia do seu datacenter é um exemplo de OpEx.",
      "Implantar seu próprio datacenter é um exemplo de CapEx."
    ],
    "respostas": [false, true, true],
    "explicacao": "O modelo de pagamento conforme o uso no Azure é classificado como OpEx (despesa operacional), pois envolve custos variáveis e contínuos. Já pagar pela energia do datacenter e implantar a infraestrutura física são exemplos de CapEx (despesa de capital), relacionados a investimentos fixos e infraestrutura local.",
    "link": "https://learn.microsoft.com/pt-br/azure/cloud-adoption-framework/strategy/inform/cost-efficiency",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  },
  // Questao 04
  {
    "tipo": "combobox",
    "texto": "Selecione a resposta que completa a frase corretamente: O SLA (contrato de nível de serviço) de um provedor de serviço de nuvem expressa <combobox> como uma porcentagem do tempo de atividade ao longo de um determinado ano.",
    "opcoes": [
      "Selecione uma resposta",
      "disponibilidade",
      "elasticidade",
      "confiabilidade",
      "escalabilidade"
    ],
    "resposta": 1,
    "explicacao": "O SLA (Service Level Agreement) mede a **disponibilidade** dos serviços de nuvem, normalmente apresentada como um percentual de tempo de atividade garantido ao longo de um período, como 99,9% em um ano.",
    "link": "https://learn.microsoft.com/pt-br/dynamics365/supply-chain/service-management/service-level-agreements",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  },
    // Questao 05
  {
    "tipo": "unica",
    "texto": "Sua empresa hospeda um aplicativo contábil chamado App1, que é usado por todos os clientes da empresa. O App1 apresenta uso baixo durante as três primeiras semanas de cada mês e uso muito alto durante a última semana de cada mês. Qual benefício dos Serviços de Nuvem do Azure dá suporte ao gerenciamento de custo para esse tipo de padrão de uso?",
    "opcoes": [
      "alta disponibilidade",
      "balanceamento de carga",
      "elasticidade",
      "alta latência"
    ],
    "resposta": 2,
    "explicacao": "A elasticidade é a capacidade da nuvem de ajustar automaticamente os recursos computacionais com base na demanda. Isso permite otimizar os custos em cenários com variação de uso, como o do App1.",
    "link": "https://learn.microsoft.com/pt-br/azure/architecture/guide/design-principles/scale-out",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  },
    // Questao 06
  {
    "tipo": "unica",
    "texto": "Qual é um exemplo de escala vertical em um ambiente de nuvem?",
    "opcoes": [
      "adição de outra CPU a uma máquina virtual do Azure existente",
      "adição de outra máquina virtual do Azure",
      "adição de outro host de sessão da Área de Trabalho Virtual do Azure",
      "adição automática de outra instância do Serviço de Aplicativo do Azure"
    ],
    "resposta": 0,
    "explicacao": "Escala vertical (scale up) refere-se ao aumento dos recursos de uma instância existente, como adicionar mais CPU ou memória a uma máquina virtual. Já a escala horizontal (scale out) envolve adicionar mais instâncias para distribuir a carga.",
    "link": "https://learn.microsoft.com/pt-br/azure/architecture/best-practices/auto-scaling",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  },
  // Questao 07
  {
    "tipo": "simnao",
    "texto": "Para cada uma das afirmações a seguir, selecione Sim se a afirmação for verdadeira. Caso contrário, selecione Não.",
    "afirmacoes": [
      "A computação em nuvem oferece custos menores de CapEx (despesas de capital) do que as implantações locais.",
      "A computação em nuvem fornece as mesmas opções de configuração que as implantações locais.",
      "A computação em nuvem poderá ser escalonada quando um negócio exigir alterações."
    ],
    "respostas": [true, false, true],
    "explicacao": "A computação em nuvem reduz os custos de CapEx ao substituí-los por OpEx. As opções de configuração são diferentes, não idênticas, às implantações locais. Um dos principais benefícios da nuvem é a escalabilidade sob demanda, que permite adaptar recursos conforme as necessidades do negócio.",
    "link": "https://learn.microsoft.com/pt-br/azure/cloud-adoption-framework/strategy/inform/cost-efficiency",
    "dominio": "Descrever os conceitos da nuvem",
    "simulado": "az-1"
  }


];
