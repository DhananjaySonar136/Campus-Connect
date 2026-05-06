# Campus Connect Mobile

React Native frontend for the Campus Connect Spring Boot API.

## Folder Structure

```text
mobile/
  App.tsx
  src/
    api/          # Axios client and backend endpoint wrappers
    components/   # Reusable UI components
    constants/    # App colors and environment config
    context/      # Auth state provider
    navigation/   # Root navigation setup
    screens/      # Login, registration, and profile screens
    storage/      # Token/user persistence
    types/        # Shared TypeScript contracts
```

## Run

```bash
cd mobile
npm install
npm start
```

Keep the backend running at `http://localhost:8080`.

For Android Emulator, set `API_BASE_URL` in `src/constants/config.ts` to:

```ts
export const API_BASE_URL = 'http://10.0.2.2:8080/api';
```

For a physical phone, use your computer LAN IP, for example:

```ts
export const API_BASE_URL = 'http://192.168.1.20:8080/api';
```
