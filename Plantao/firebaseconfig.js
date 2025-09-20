// No seu arquivo de configuração (ex: firebaseConfig.js)

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Cole aqui as credenciais que você copiou!
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "app-escala-plantao.firebaseapp.com",
  projectId: "app-escala-plantao",
  storageBucket: "app-escala-plantao.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);

// Exporta a instância do banco de dados para ser usada em outros lugares
export const db = app.firestore();

async function importJson(file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (!data || !Array.isArray(data.squads) || !Array.isArray(data.oncalls)) {
              alert("Arquivo JSON inválido. Verifique a estrutura.");
              return;
            }

            // Inicia um lote de escrita no Firestore
            const batch = db.batch();

            // Adiciona todas as squads ao lote
            data.squads.forEach(squad => {
              const docRef = db.collection('squads').doc(); // Cria um novo documento com ID aleatório
              batch.set(docRef, { name: squad.name });
            });
            
            // Adiciona todos os plantonistas ao lote
            data.oncalls.forEach(oncall => {
              const docRef = db.collection('oncalls').doc(); // Cria um novo documento
              batch.set(docRef, {
                squadId: oncall.squadId,
                personName: oncall.personName,
                phone: oncall.phone,
                hours: oncall.hours
              });
            });

            // Envia todas as operações para o Firebase de uma só vez
            await batch.commit();
            setToast("Dados do JSON importados para todos os usuários!");

          } catch (e) {
            console.error("Erro ao importar JSON:", e);
            alert("Não foi possível processar o arquivo JSON.");
          }
        };
        reader.readAsText(file);
      }

      async function importCsv(file) {
        // Para o CSV funcionar, precisamos saber o ID da squad onde os plantonistas serão adicionados.
        // Vamos pegar o ID da squad que está sendo visualizada no momento.
        const currentSquadId = view.squadId;
        if (!currentSquadId) {
            alert("Por favor, abra uma squad antes de importar um CSV de plantonistas.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const text = event.target.result;
            const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
            
            // A primeira linha (cabeçalho) deve ter: personName,phone,hours
            const [header, ...rows] = lines;
            const cols = header.split(",").map(c => c.trim());

            const batch = db.batch();

            rows.forEach(row => {
              const values = row.split(",");
              const oncallData = { squadId: currentSquadId }; // Associa à squad atual
              
              cols.forEach((col, index) => {
                oncallData[col] = values[index]?.trim() || "";
              });

              const docRef = db.collection('oncalls').doc();
              batch.set(docRef, oncallData);
            });

            await batch.commit();
            setToast(`Plantonistas do CSV importados para a squad atual!`);

          } catch (e) {
            console.error("Erro ao importar CSV:", e);
            alert("Não foi possível processar o arquivo CSV.");
          }
        };
        reader.readAsText(file);
      }
      <label className="seu-estilo-de-botao">
  Importar
  <input
    type="file"
    accept=".json,.csv"
    className="hidden"
    onChange={(e) => {
      const f = e.target.files?.[0];
      if (f) {
        if (f.name.endsWith(".json")) {
          importJson(f); // Chama a nova função async
        } else if (f.name.endsWith(".csv")) {
          importCsv(f); // Chama a nova função async
        }
      }
      e.currentTarget.value = ""; // Limpa o input para permitir importar o mesmo arquivo novamente
    }}
  />
</label>