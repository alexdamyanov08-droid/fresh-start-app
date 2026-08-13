-- Datos de facturacion opcionales (razon social, CIF/NIF, direccion fiscal),
-- solo rellenos cuando el cliente marca en el checkout que necesita
-- factura con sus datos fiscales. Null cuando no los pide.
alter table public.orders add column if not exists invoice_data jsonb;
