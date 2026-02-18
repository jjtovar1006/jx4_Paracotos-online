<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1AeUgO4YLMD4Tezrk-7ojOg8J-eqhUol7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Migraciones y base de datos (Supabase)

Si prefieres ejecutar las migraciones y seed contra un proyecto Supabase (hosted) en lugar de levantar Docker local, hay un helper seguro que pide la `DATABASE_URL` sin guardarla en disco.

- Ejecutar el helper (desde la raíz del repo):

```powershell
npm run run:supabase
```

El script te pedirá la `DATABASE_URL` de tu proyecto Supabase; pégala en la consola (no la compartas en el chat). El helper aplicará las migraciones y el seed y luego ejecutará una comprobación.

Si prefieres hacerlo manualmente en la sesión actual de PowerShell sin guardar la URL, define la variable de entorno temporalmente:

```powershell
$env:DATABASE_URL = 'postgresql://usuario:contraseña@host:5432/dbname'
npm --prefix .\jx4-paracotos run migrate
npm --prefix .\jx4-paracotos run seed
node .\jx4-paracotos\scripts\check-seed.js
```

Precaución: ejecuta migraciones en un proyecto de prueba para evitar afectar datos de producción.
