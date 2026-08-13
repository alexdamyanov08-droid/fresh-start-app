#!/usr/bin/env python3
"""
Guarda en el repo la migracion que concede los permisos que faltaban
(GRANT) para que "service_role" (la cuenta interna que usan las Edge
Functions para crear/actualizar pedidos) pueda escribir en las tablas
"orders" y "admins". El arreglo YA se aplico directamente en Supabase via
SQL Editor; este script solo deja constancia en el repo para que quede
correcto en futuros despliegues.

Uso: colocar este archivo en la raiz del repo (fresh-start-app) y ejecutar:
    python3 fix_grant_service_role_orders.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

CONTENT = '''-- Correccion: aunque "service_role" normalmente salta las politicas RLS
-- (BYPASSRLS), Postgres sigue exigiendo el permiso BASE (GRANT) sobre la
-- tabla para poder leer/escribir en ella. Sin este GRANT, las Edge
-- Functions que usan la clave de administrador (service_role) para crear
-- o actualizar pedidos fallan con "permission denied", aunque el codigo
-- y las claves esten bien configuradas.

grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.admins to service_role;
'''

path = ROOT / "supabase/migrations/20260813000001_grant_service_role_orders_admins.sql"
if path.exists():
    print(f"AVISO: {path} ya existe, no se sobrescribe (¿ya estaba aplicado?)")
    sys.exit(0)
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(CONTENT, encoding="utf-8")
print(f"OK: creado {path.relative_to(ROOT)}")
print()
print("Este SQL ya lo aplicaste a mano en Supabase, asi que no hace falta")
print("volver a ejecutar 'supabase db push' ahora. Solo guarda el archivo")
print("y haz el commit para que quede constancia en el repo.")
