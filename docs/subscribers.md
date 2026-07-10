# Subscribers

El suscriptor inicial se registra con `deployments/5g-sa/mongo/subscriber-init.js` usando variables de `deployments/5g-sa/.env`.

Variables requeridas:

- `SUBSCRIBER_IMSI`
- `SUBSCRIBER_KEY`
- `SUBSCRIBER_OPC`
- `SUBSCRIBER_AMF`
- `SUBSCRIBER_SQN`

El script usa `updateOne(..., { upsert: true })`, por lo que evita duplicados y actualiza el registro si ya existe.

Los secretos se validan pero no se imprimen completos en logs.
