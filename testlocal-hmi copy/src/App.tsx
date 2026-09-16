import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  createGrpcWebOperatorRequestTransport,
  createNodeProgramSession,
  readHmiLaunchParams,
  resolveSessionEdgeId,
  type NodeConfigurationField,
  type NodeExecutionState,
  type NodeProgramSession,
  type NodeProgramState,
  type OperatorRequestEvent,
} from "@neuraverse/custom-hmi-sdk/runtime";

import {
  getSameOriginHostAuth,
  isAllowedHostOrigin,
  isEmbeddedInHost,
  parseHostAuth,
  requestHostAuth,
} from "./hostAuth";
import {
  GRAPH,
  PROGRAM,
  logicalNodeId,
  matchProgramNode,
  nodeInfo,
  type ProgramNode,
} from "./program";

const TOKEN_KEY = "testlocal-hmi.rocp_token";
const ORG_KEY = "testlocal-hmi.orgId";

type NodeLiveState = {
  state: NodeExecutionState;
  statusMessage: string;
};

type Toast = { id: number; title: string; body: string; tone: "true" | "false" | "info" };

function statusNote(message: string): string {
  if (!message) return "";
  let text = message.replace(/^\[resend\]\s*/i, "").trim();
  const marker = " | Message: ";
  const idx = text.lastIndexOf(marker);
  if (idx >= 0) text = text.slice(idx + marker.length).trim();
  if (
    text.startsWith("Condition ") ||
    text.startsWith("Starts with ") ||
    text.startsWith("Branches ")
  ) {
    return text;
  }
  if (/\bif_true\b/i.test(text)) return "Condition true → if_true";
  if (/\bif_false\b/i.test(text)) return "Condition false → if_false";
  return "";
}

function fieldValue(node: ProgramNode, key: string, live?: string): string {
  return live ?? node.configuration?.[key] ?? "";
}

export default function App() {
  const launch = useMemo(
    () =>
      readHmiLaunchParams({
        env: {
          localEngine: import.meta.env.VITE_LOCAL_ENGINE,
          programId: import.meta.env.VITE_PROGRAM_ID,
          projectId: import.meta.env.VITE_PROJECT_ID,
        },
      }),
    [],
  );
  const framed = isEmbeddedInHost();
  const [token, setToken] = useState(() =>
    framed ? "" : (localStorage.getItem(TOKEN_KEY) ?? ""),
  );
  const [orgId, setOrgId] = useState(() =>
    framed ? "" : (localStorage.getItem(ORG_KEY) ?? ""),
  );
  const [hostAuth, setHostAuth] = useState(() => Boolean(getSameOriginHostAuth()));
  const [waitingHost, setWaitingHost] = useState(
    () => !launch.localEngine && framed && !getSameOriginHostAuth(),
  );
  const [showManual, setShowManual] = useState(
    () => !launch.localEngine && !framed && !getSameOriginHostAuth(),
  );
  const [session, setSession] = useState<NodeProgramSession | null>(null);
  const [programState, setProgramState] = useState<NodeProgramState | "idle">("idle");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [live, setLive] = useState<Record<string, NodeLiveState>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [operator, setOperator] = useState<OperatorRequestEvent | null>(null);
  const [operatorValues, setOperatorValues] = useState<Record<string, string>>({});
  const [operatorBusy, setOperatorBusy] = useState(false);

  const sessionRef = useRef<NodeProgramSession | null>(null);
  const tokenRef = useRef(token);
  const orgIdRef = useRef(orgId);
  const statusSub = useRef<{ cancel(): void } | null>(null);
  const operatorSub = useRef<{ cancel(): void } | null>(null);
  const toastId = useRef(0);
  const connectingRef = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    orgIdRef.current = orgId;
  }, [orgId]);

  useEffect(
    () => () => {
      statusSub.current?.cancel();
      operatorSub.current?.cancel();
    },
    [],
  );

  const pushToast = (title: string, body: string) => {
    const id = ++toastId.current;
    const tone = body.includes("false") ? "false" : body.includes("true") ? "true" : "info";
    setToasts((items) => [...items, { id, title, body, tone }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 1800);
  };

  const rememberSettings = () => {
    localStorage.setItem(TOKEN_KEY, token.trim());
    localStorage.setItem(ORG_KEY, orgId.trim());
  };

  const readAccessToken = async () => {
    const host = getSameOriginHostAuth();
    if (host) {
      const next = (await host.getAccessToken()).trim();
      if (next) {
        tokenRef.current = next;
        return next;
      }
    }
    return tokenRef.current.trim();
  };

  const connectWith = async (persist: boolean) => {
    if (connectingRef.current) return;
    connectingRef.current = true;
    setError("");
    setBusy("Connecting");
    if (persist) rememberSettings();
    try {
      const host = getSameOriginHostAuth();
      const organizationId = (host?.getOrgId() || orgIdRef.current).trim();
      if (host && organizationId) {
        orgIdRef.current = organizationId;
        setOrgId(organizationId);
      }
      const edgeId = resolveSessionEdgeId(GRAPH, { localEngine: launch.localEngine });
      if (!edgeId) {
        throw new Error(
          "This graph has no selectedEdgeLocation. Set VITE_LOCAL_ENGINE=true or an edge on the graph.",
        );
      }
      const next = createNodeProgramSession({
        accessToken: readAccessToken,
        edgeId,
        projectId: GRAPH.projectId || launch.projectId,
        graph: structuredClone(GRAPH),
        localEngine: launch.localEngine,
        operatorRequestTransport: createGrpcWebOperatorRequestTransport({
          accessToken: readAccessToken,
        }),
      });
      statusSub.current?.cancel();
      operatorSub.current?.cancel();
      setSession(next);
      setProgramState(next.state);
      setLive({});
      setOperator(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the program.");
      if (framed) setShowManual(true);
    } finally {
      connectingRef.current = false;
      setBusy("");
    }
  };

  const connect = async (event: FormEvent) => {
    event.preventDefault();
    await connectWith(true);
  };

  useEffect(() => {
    if (launch.localEngine) return;

    const sameOrigin = getSameOriginHostAuth();
    if (sameOrigin) {
      void sameOrigin
        .getAccessToken()
        .then((next) => {
          if (!next.trim()) {
            setWaitingHost(false);
            setShowManual(true);
            return;
          }
          tokenRef.current = next;
          setToken(next);
          const nextOrg = sameOrigin.getOrgId();
          if (nextOrg) {
            orgIdRef.current = nextOrg;
            setOrgId(nextOrg);
          }
          setHostAuth(true);
          setWaitingHost(false);
          setShowManual(false);
        })
        .catch(() => {
          setWaitingHost(false);
          setShowManual(true);
        });
      return;
    }

    if (!framed) return;

    let retry = 0;
    let giveUp = 0;
    const stopRetry = () => {
      if (retry) window.clearInterval(retry);
      retry = 0;
    };

    const onAuth = (event: MessageEvent) => {
      if (!isAllowedHostOrigin(event.origin)) return;
      const auth = parseHostAuth(event.data);
      if (!auth) return;
      tokenRef.current = auth.token;
      setToken(auth.token);
      if (auth.orgId) {
        orgIdRef.current = auth.orgId;
        setOrgId(auth.orgId);
      }
      setHostAuth(true);
      setWaitingHost(false);
      setShowManual(false);
      stopRetry();
      if (giveUp) window.clearTimeout(giveUp);
    };

    window.addEventListener("message", onAuth);
    requestHostAuth();
    retry = window.setInterval(requestHostAuth, 400);
    giveUp = window.setTimeout(() => {
      stopRetry();
      setWaitingHost((waiting) => {
        if (waiting) setShowManual(true);
        return false;
      });
    }, 8000);

    return () => {
      window.removeEventListener("message", onAuth);
      stopRetry();
      window.clearTimeout(giveUp);
    };
  }, [framed, launch.localEngine]);

  useEffect(() => {
    if (session) return;
    if (launch.localEngine) {
      void connectWith(false);
      return;
    }
    if (!hostAuth) return;
    if (!token.trim() || !orgId.trim()) return;
    void connectWith(false);
  }, [hostAuth, token, orgId, session, launch.localEngine]);

  const subscribeAfterConfigure = async (active: NodeProgramSession) => {
    statusSub.current?.cancel();
    operatorSub.current?.cancel();
    statusSub.current = await active.subscribeNodeStatuses({
      onStatus: (event) => {
        const logical = logicalNodeId(event.nodeId);
        setLive((current) => ({
          ...current,
          [event.nodeId]: {
            state: event.state,
            statusMessage: event.statusMessage,
          },
          ...(logical !== event.nodeId
            ? {
                [logical]: {
                  state: event.state,
                  statusMessage: event.statusMessage,
                },
              }
            : {}),
        }));
        const note = statusNote(event.statusMessage);
        if (!note || /^\[resend\]/i.test(event.statusMessage)) return;
        const named = matchProgramNode(event.nodeId);
        pushToast(named?.name || event.nodeId, note);
      },
      onError: (err) => setError(err.message),
    });
    operatorSub.current = await active.subscribeOperatorRequests({
      onRequest: (request) => {
        setOperator(request);
        setOperatorValues(
          Object.fromEntries(request.fields.map((field) => [field.key, field.value])),
        );
      },
      onError: (err) => setError(err.message),
    });
  };

  const applyEdits = (active: NodeProgramSession) => {
    for (const [nodeId, fields] of Object.entries(edits)) {
      for (const [key, value] of Object.entries(fields)) {
        active.setNodeConfiguration(nodeId, key, value);
      }
    }
  };

  const runAction = async (
    label: string,
    work: (active: NodeProgramSession) => Promise<void>,
  ) => {
    if (!session) return;
    setError("");
    setBusy(label);
    try {
      await work(session);
      setProgramState(session.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label} failed.`);
    } finally {
      setBusy("");
    }
  };

  const prepare = () =>
    runAction("Preparing", async (active) => {
      applyEdits(active);
      const result = await active.prepareForRun();
      const failures = result.initialization.nodes.filter((node) => !node.success);
      if (failures.length > 0) {
        throw new Error(
          failures.map((node) => `${node.nodeId}: ${node.message}`).join(" "),
        );
      }
    });

  const configure = () =>
    runAction("Configuring", async (active) => {
      applyEdits(active);
      await active.configure();
      await subscribeAfterConfigure(active);
    });

  const run = () =>
    runAction("Starting", async (active) => {
      await active.run({ startNodeId: PROGRAM.startNodeId });
    });

  const stop = () =>
    runAction("Stopping", async (active) => {
      await active.stop();
      setOperator(null);
    });

  const startNode = (nodeId: string) =>
    runAction("Starting node", async (active) => {
      await active.triggerStart(nodeId);
    });

  const replyOperator = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !operator) return;
    setOperatorBusy(true);
    setError("");
    try {
      await session.replyOperatorRequest({
        requestId: operator.requestId,
        values: operatorValues,
      });
      setOperator(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reply failed.");
    } finally {
      setOperatorBusy(false);
    }
  };

  const connected = Boolean(session);

  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="kicker">Custom HMI</p>
          <h1>{PROGRAM.name}</h1>
          <p className="meta">
            {launch.programId} · {launch.projectId}
            {launch.localEngine ? " · local engine" : ""}
          </p>
        </div>
        <span className={`state state--${programState}`}>{programState}</span>
      </header>

      {waitingHost ? (
        <p className="host-auth">Waiting for Neuraverse host…</p>
      ) : null}

      {hostAuth && !showManual ? (
        <p className="host-auth">Signed in via Neuraverse</p>
      ) : null}

      {showManual ? (
        <form className="settings" onSubmit={connect}>
          <label>
            rocp_token
            <textarea
              required
              rows={3}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Bearer token"
            />
          </label>
          <label>
            orgId
            <input
              required
              value={orgId}
              onChange={(event) => setOrgId(event.target.value)}
              placeholder="Organization id"
            />
          </label>
          <button type="submit" disabled={Boolean(busy)}>
            {busy === "Connecting" ? "Connecting…" : connected ? "Reconnect" : "Connect"}
          </button>
        </form>
      ) : null}

      <div className="actions">
        <button
          type="button"
          disabled={!session || !["loaded", "stopped"].includes(programState) || Boolean(busy)}
          onClick={() => void prepare()}
        >
          Prepare
        </button>
        <button
          type="button"
          disabled={!session || programState !== "initialized" || Boolean(busy)}
          onClick={() => void configure()}
        >
          Configure
        </button>
        <button
          type="button"
          disabled={!session || programState !== "configured" || Boolean(busy)}
          onClick={() => void run()}
        >
          Run
        </button>
        <button
          type="button"
          disabled={!session || !["configured", "running"].includes(programState) || Boolean(busy)}
          onClick={() => void stop()}
        >
          Stop
        </button>
        {busy ? <span className="busy">{busy}…</span> : null}
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="grid">
        {PROGRAM.nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            live={live[node.id]}
            editValue={(key) => edits[node.id]?.[key] ?? fieldValue(node, key)}
            onEdit={(key, value) =>
              setEdits((current) => ({
                ...current,
                [node.id]: { ...current[node.id], [key]: value },
              }))
            }
            canStart={
              Boolean(session) &&
              ["configured", "running"].includes(programState) &&
              !busy
            }
            onStart={() => void startNode(node.id)}
          />
        ))}
      </section>

      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <strong>{toast.title}</strong>
            <span>{toast.body}</span>
          </div>
        ))}
      </div>

      {operator ? (
        <div className="overlay">
          <form className="modal" onSubmit={replyOperator}>
            <p className="kicker">Waiting · {operator.className}</p>
            <h2>{matchProgramNode(operator.nodeId)?.name || operator.nodeName}</h2>
            <p>{operator.prompt}</p>
            {operator.fields.map((field) => (
              <OperatorField
                key={field.key}
                field={field}
                value={operatorValues[field.key] ?? ""}
                onChange={(value) =>
                  setOperatorValues((current) => ({ ...current, [field.key]: value }))
                }
              />
            ))}
            <button type="submit" disabled={operatorBusy}>
              {operatorBusy ? "Sending…" : "Continue"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function NodeCard({
  node,
  live,
  editValue,
  onEdit,
  canStart,
  onStart,
}: {
  node: ProgramNode;
  live?: NodeLiveState;
  editValue: (key: string) => string;
  onEdit: (key: string, value: string) => void;
  canStart: boolean;
  onStart: () => void;
}) {
  const info = useMemo(() => nodeInfo(node), [node]);
  const note = live ? statusNote(live.statusMessage) : "";

  return (
    <article className={`card ${node.emitToHmi ? "card--hmi" : ""}`}>
      <header>
        <div>
          <h2>{node.name}</h2>
          <p>{node.className}</p>
        </div>
        <span className={`pill ${live?.state === "RUNNING" ? "pill--run" : ""}`}>
          {live?.state ?? (node.emitToHmi ? "HMI" : "auto")}
        </span>
      </header>
      <p className="info">{note || info}</p>
      {node.className === "SleepNode" && node.emitToHmi ? (
        <label>
          Sleep time (s)
          <input
            type="number"
            min={0}
            step="0.1"
            value={editValue("sleep_time")}
            onChange={(event) => onEdit("sleep_time", event.target.value)}
          />
        </label>
      ) : null}
      {node.className === "IfNode" ? (
        <p className="maps">
          Data in: {node.maps?.in.join(", ") || "Data"} · out:{" "}
          {node.maps?.out.join(", ") || "result"}
        </p>
      ) : null}
      <button type="button" disabled={!canStart} onClick={onStart}>
        Start this node
      </button>
    </article>
  );
}

function OperatorField({
  field,
  value,
  onChange,
}: {
  field: NodeConfigurationField;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = `op-${field.key}`;
  return (
    <label htmlFor={inputId}>
      {field.label}
      {field.controlType === "toggle" ? (
        <input
          id={inputId}
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => onChange(event.target.checked ? "true" : "false")}
        />
      ) : (
        <input
          id={inputId}
          type={field.controlType === "number" || field.controlType === "range" ? "number" : "text"}
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          required={field.required}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.description ? <small>{field.description}</small> : null}
    </label>
  );
}
