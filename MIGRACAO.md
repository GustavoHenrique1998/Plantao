# Como migrar o frontend para a API

## 1) Trocar inicialização do Firebase

Remova os scripts do Firebase e substitua por uma configuração simples da API:

```html
<script>
  const API_BASE = 'http://localhost:3000/api';
</script>
```

## 2) Criar um helper de API

```js
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na API');
  return data;
}
```

## 3) Substituir useEffect do Firebase

Antes:

```js
useEffect(() => {
  const unsubSquads = db.collection('squads').onSnapshot(...)
}, [])
```

Depois:

```js
useEffect(() => {
  Promise.all([
    api('/squads'),
    api('/oncalls'),
    api('/cds'),
    api('/cd-contacts'),
    api('/filiais'),
    api('/filial-contacts')
  ]).then(([squads, oncalls, cds, cdContacts, filiais, filialContacts]) => {
    setSquads(squads);
    setOnCalls(oncalls);
    setCds(cds);
    setCdContacts(cdContacts);
    setFiliais(filiais);
    setFilialContacts(filialContacts);
  });
}, []);
```

## 4) Substituir chamadas CRUD

Exemplo:

```js
await api('/squads', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

## 5) Autenticação

Se quiser manter login admin, eu recomendo:
- JWT no backend
- cookie ou Authorization header
- proteger endpoints de escrita com middleware
