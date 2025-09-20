function EscalationApp() {
        
  // O estado agora começa vazio e será preenchido com dados do Firebase
        const [squads, setSquads] = useState([]);
        const [oncalls, setOnCalls] = useState([]);

        const [query, setQuery] = useState("");
        const [view, setView] = useState({ page: "home", squadId: null });
        const [admin, setAdmin] = useState(false);
        const [toast, setToast] = useState(null);

        // HOOK PARA LER DADOS EM TEMPO REAL
        useEffect(() => {
          // Listener para a coleção 'squads'
          const unsubscribeSquads = db.collection('squads').onSnapshot(snapshot => {
            const squadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSquads(squadsData);
          });

          // Listener para a coleção 'oncalls'
          const unsubscribeOnCalls = db.collection('oncalls').onSnapshot(snapshot => {
            const oncallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOnCalls(oncallsData);
          });

          // Função de limpeza para parar de "ouvir" quando o componente for desmontado
          return () => {
            unsubscribeSquads();
            unsubscribeOnCalls();
          };
        }, []); // Array vazio significa que este efeito roda apenas uma vez

        // Lógica de filtragem e seleção continua a mesma
        const filteredSquads = useMemo(() => { /* ...mesmo código de antes... */ }, [query, squads]);
        const selectedSquad = useMemo(() => squads.find((s) => s.id === view.squadId) || null, [view, squads]);
        const selectedOnCalls = useMemo(() => oncalls.filter((o) => o.squadId === view.squadId).sort((a, b) => a.personName.localeCompare(b.personName)), [oncalls, view]);

        // ===== FUNÇÕES CRUD ATUALIZADAS PARA O FIREBASE =====
        
        async function addSquad(name) {
          const n = name?.trim(); if (!n) return;
          await db.collection('squads').add({ name: n });
          setToast(`Squad "${n}" criada.`);
        }

        async function editSquad(id, name) {
          const n = name?.trim(); if (!n) return;
          await db.collection('squads').doc(id).update({ name: n });
          setToast("Squad atualizada.");
        }

        async function deleteSquad(id) {
          if (!confirm("Remover esta squad e todos os plantonistas ligados a ela?")) return;
          
          // Deleta o documento da squad
          await db.collection('squads').doc(id).delete();

          // Encontra e deleta todos os plantonistas associados
          const oncallsSnapshot = await db.collection('oncalls').where('squadId', '==', id).get();
          const batch = db.batch();
          oncallsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();

          if (view.squadId === id) setView({ page: "home", squadId: null });
          setToast("Squad removida.");
        }

        async function addOnCall(squadId, payload) {
          await db.collection('oncalls').add({ squadId, ...payload });
          setToast("Plantonista adicionado.");
        }

        async function editOnCall(id, payload) {
          // Remove o squadId do payload para não alterá-lo acidentalmente
          const { squadId, ...dataToUpdate } = payload;
          await db.collection('oncalls').doc(id).update(dataToUpdate);
          setToast("Plantonista atualizado.");
        }

        async function deleteOnCall(id) {
          if (!confirm("Remover este plantonista?")) return;
          await db.collection('oncalls').doc(id).delete();
          setToast("Plantonista removido.");
        }
        
        // As funções de import/export JSON podem ser removidas ou adaptadas
        // por enquanto vamos deixá-las de fora para simplificar.

        // O JSX (parte visual) continua exatamente o mesmo!
        return (
          <div className="min-h-screen bg-light text-secondary">
            <header> {/* ... seu header ... (remova os botões de import/export) */} </header>
            <main className="max-w-6xl mx-auto px-4 py-8">
              {view.page === "home" && (
                <HomeView
                  /* ... passe as props normalmente, usando as novas funções ... */
                  onCreateSquad={admin ? addSquad : undefined}
                  onEditSquad={admin ? editSquad : undefined}
                  onDeleteSquad={admin ? deleteSquad : undefined}
                />
              )}
              {view.page === "detail" && selectedSquad && (
                <DetailView
                  /* ... passe as props normalmente ... */
                  onAdd={admin ? (payload) => addOnCall(selectedSquad.id, payload) : undefined}
                  onEdit={admin ? editOnCall : undefined}
                  onDelete={admin ? deleteOnCall : undefined}
                />
              )}
              {/* ... resto do JSX ... */}
            </main>
            <footer> {/* ... seu footer ... */} </footer>
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
          </div>
          
        );
      }