# testlocal HMI

React panel for the hardcoded `testlocal` graph. This app only supplies
`.env` values and UI. Local-engine / program / project / edge resolution
lives in `@neuraverse/custom-hmi-sdk/runtime`.

## Run

```bash
npm install
npm run dev
```

Opens on [http://127.0.0.1:5175/custom-hmi/](http://127.0.0.1:5175/custom-hmi/).

Copy `.env.example` to `.env`:

```
VITE_LOCAL_ENGINE=true
VITE_PROGRAM_ID=nodegraph:1788533000471
VITE_PROJECT_ID=c8085f9b-348b-41e5-b8c4-9872e34be9ba
```

Restart Vite after editing `.env`. URL query params (`?localEngine=`, `?programId=`,
`?projectId=`) still override.

Standalone local engine does not need `rocp_token` / `orgId`. Cloud
(`VITE_LOCAL_ENGINE=false`) does.

Vite proxies:

- `/envoy/project` and `/http` → `app.dev` (load the saved program)
- `/envoy/node-engine` → local Envoy `:8092`

Connect, then **Prepare → Configure → Run**. Sleep / If nodes with Emit to HMI
pause in the operator modal. Status toasts show sleep start time and If branches.
