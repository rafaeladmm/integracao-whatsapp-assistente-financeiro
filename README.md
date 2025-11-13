# Painel WhatsApp - Controle de Gastos (Demo)

Passo a passo rápido para rodar localmente:

## Requisitos
- Node.js (versão 14+)
- ngrok (ou similar) instalado e autenticado

## Backend
1. Abra um terminal:
2. Vá para a pasta `backend`:
   ```
   cd whatsapp-gastos/backend
   ```
3. Instale dependências:
   ```
   npm install
   ```
4. Inicie o servidor:
   ```
   npm start
   ```
   O servidor ficará escutando na porta 3000.

## Expor com ngrok
No outro terminal, rode:
```
ngrok http 3000
```
Copie o *Forwarding* HTTPS (ex: `https://abc123.ngrok-free.dev`).

## Configurar Twilio Sandbox (WhatsApp)
- No console Twilio → WhatsApp Sandbox → configure **When a message comes in** com:
  ```
  https://<seu-forwarding>/incoming
  ```
  (ex: `https://abc123.ngrok-free.dev/incoming`)

## Frontend (demo)
1. Abra `frontend/index.html` no navegador (duplo clique) **ou** rode um servidor estático apontando para a pasta `frontend`.
2. Antes de abrir, edite a variável `window.API_BASE` no topo do `frontend/index.html` e cole o forwarding do ngrok.
   Ex:
   ```
   <script> window.API_BASE = 'https://abc123.ngrok-free.dev'; </script>
   ```
3. Abra a página no navegador. O painel fará requisições para `https://.../gastos`.

## Teste
- No WhatsApp (sandbox) envie:
  ```
  gastei 25 lanche
  ```
- Verifique no terminal do backend que a mensagem foi recebida e que o backend gerou resposta.
- No frontend o item deve aparecer em segundos.

## Observações
- Se as mensagens não chegarem ao WhatsApp de volta, pode ser restrição/regra da Twilio para o país (problema de entrega). Ainda assim, o backend registra o gasto e a interface mostrará o registro.
- Para produção, troque db.json por um banco real (SQLite, Postgres) e proteja as rotas.
