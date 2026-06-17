// ==============================================================================
// 🟢 PLANTÃO MAGALU - SCRIPT DE INTEGRAÇÃO (COPIE E COLE NO GOOGLE APPS SCRIPT)
// ==============================================================================
// 1. No Google Sheets da sua escala, clique em "Extensões" > "Apps Script".
// 2. Apague o código que estiver lá e cole este arquivo inteiro.
// 3. Salve e atualize sua planilha (dê F5 nela).
// 4. Um botão "⚙️ Plantão Magalu" vai aparecer no menu superior.

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ Plantão Magalu')
      .addItem('Sincronizar Escalas com a Nuvem', 'syncDataTrigger')
      .addToUi();
}

function syncDataTrigger() {
  const ui = SpreadsheetApp.getUi();
  const confirmation = ui.alert('Confirmar Sincronização', 'Você tem certeza que quer enviar a foto ATUAL desta planilha para o Aplicativo Web?\n\nIsso irá substituir os plantonistas no banco de dados.', ui.ButtonSet.YES_NO);
  
  if (confirmation !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // A linha 1 da sua planilha são os cabeçalhos.
  // Exemplo de colunas sugeridas: Squad, Nome, Telefone, Cargo_Horas, Observacao, Subgrupo, Ordem
  const headers = data[0];
  const rows = data.slice(1);
  
  const payloadData = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Normalização: remove acentos, espaços viram _, e joga para caixa baixa.
      // Ex: "Cargo/Horas" -> "cargohoras", "Nome" -> "nome".
      const key = header.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, "_").replace(/_$/, '');
      obj[key] = row[index];
    });
    return obj;
  });

  // Filtramos apenas as linhas que possuem o nome preenchido para evitar lixo.
  const validData = payloadData.filter(item => item.nome && item.nome.toString().trim() !== "");

  const payload = { data: validData };

  // ⚠️ ATENÇÃO: Substitua a URL abaixo pela URL que o Firebase gerar na sua Cloud Function.
  // Você descobre essa URL após rodar o comando: firebase deploy --only functions
  const url = "https://us-central1-app-escala-plantao.cloudfunctions.net/syncExcelOncalls";
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer SUASENHA_MUITO_SECRETA_123"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const resultContent = response.getContentText();
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(resultContent);
      ui.alert("✅ Sucesso!", result.message, ui.ButtonSet.OK);
    } else {
      ui.alert("❌ Erro no Backend do Firebase", "Resposta do servidor: " + resultContent, ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert("❌ Erro de Conexão", "Falha ao atingir o servidor: " + e.message, ui.ButtonSet.OK);
  }
}
