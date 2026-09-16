import type { ProgramDocument } from "@neuraverse/custom-hmi-sdk/platform";
import { resolveProgramDocumentIds } from "@neuraverse/custom-hmi-sdk/runtime";

/** Data-port edge type in the saved editor document. */
const DATA_EDGE_TYPE = 1;

const UI_CONFIG_KEYS = new Set(["sleep_time", "expression"]);

const documentIds = resolveProgramDocumentIds({
	programId: import.meta.env.VITE_PROGRAM_ID,
	projectId: import.meta.env.VITE_PROJECT_ID,
});

export const PROGRAM_ID = documentIds.programId;
export const PROJECT_ID = documentIds.projectId;

/**
 * Saved editor document used as the Node Engine Configure source.
 * testlocal-hmi does not download this via getProgram.
 * `id` / `projectId` come from `.env` (`VITE_PROGRAM_ID`, `VITE_PROJECT_ID`).
 */
export const GRAPH = {
	id: PROGRAM_ID,
	name: "testlocal",
	version: "v1.0.0",
	description: "testlocal",
	tags: [],
	projectId: PROJECT_ID,
	nodes: [
		{
			id: "wK75TtuL",
			name: "Sleep Node_1",
			type: 2,
			description: "Sleeps for the configured number of seconds, then triggers the next node.",
			tags: ["Sleep", "MISC"],
			inputs: {
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				stop: {
					rosType: "Stop",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			outputs: {
				error: {
					rosType: "Error",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			assetInstanceId: "",
			executionContext: {
				type: 3,
				className: "SleepNode",
				target: "",
			},
			configuration: {
				node_namespace: "gateway",
				sleep_time: "1",
				node_deployment_host: "127.0.0.1:8500",
				is_remote: "false",
				emit_to_hmi: "true",
				x: "1938.2124642843555",
				y: "59.19007338570472",
				node_width: "280",
				height: "150",
			},
			resourceVersion: 0,
			history: [],
		},
		{
			id: "_ksuIt8E",
			name: "Sleep Node_2",
			type: 2,
			description: "Sleeps for the configured number of seconds, then triggers the next node.",
			tags: ["Sleep", "MISC"],
			inputs: {
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				stop: {
					rosType: "Stop",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			outputs: {
				error: {
					rosType: "Error",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			assetInstanceId: "",
			executionContext: {
				type: 3,
				className: "SleepNode",
				target: "",
			},
			configuration: {
				node_namespace: "gateway",
				sleep_time: "1",
				node_deployment_host: "127.0.0.1:8500",
				is_remote: "false",
				emit_to_hmi: "true",
				x: "1933.3256624257583",
				y: "610.9049633071477",
				node_width: "280",
				height: "150",
			},
			resourceVersion: 0,
			history: [],
		},
		{
			id: "uUK2SYPp",
			name: "IfNode_3",
			type: 4,
			description:
				"Evaluates a boolean expression over the values of its connected data inputs and triggers the IfTrue or IfFalse branch.",
			tags: ["If", "Else", "Flow"],
			inputs: {
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				stop: {
					rosType: "Stop",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				Data: {
					rosType: "",
					type: 1,
					requestTarget: "",
					defaultValue: "",
					edgeType: 1,
				},
			},
			outputs: {
				error: {
					rosType: "Error",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				if_false: {
					rosType: "IfFalse",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				if_true: {
					rosType: "IfTrue",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				result: {
					rosType: "/std_msgs/msg/String",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 1,
				},
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			assetInstanceId: "",
			executionContext: {
				type: 3,
				className: "IfNode",
				target: "",
			},
			configuration: {
				node_namespace: "gateway",
				node_deployment_host: "127.0.0.1:8500",
				is_remote: "false",
				emit_to_hmi: "true",
				expression: "{Data} < 20",
				x: "1077.3172035255575",
				y: "235.7330513699933",
				node_width: "280",
				height: "222",
			},
			resourceVersion: 0,
			history: [],
		},
		{
			id: "6gUg3nmc",
			name: "Sleep Node_4",
			type: 2,
			description: "Sleeps for the configured number of seconds, then triggers the next node.",
			tags: ["Sleep", "MISC"],
			inputs: {
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				stop: {
					rosType: "Stop",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			outputs: {
				error: {
					rosType: "Error",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			assetInstanceId: "",
			executionContext: {
				type: 3,
				className: "SleepNode",
				target: "",
			},
			configuration: {
				node_namespace: "gateway",
				sleep_time: "1",
				node_deployment_host: "127.0.0.1:8500",
				is_remote: "false",
				x: "644.7923869898193",
				y: "299.2173155585303",
				node_width: "280",
				height: "150",
			},
			resourceVersion: 0,
			history: [],
		},
		{
			id: "FJFyljHA",
			name: "Sleep Node_5",
			type: 2,
			description: "Sleeps for the configured number of seconds, then triggers the next node.",
			tags: ["Sleep", "MISC"],
			inputs: {
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				stop: {
					rosType: "Stop",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			outputs: {
				error: {
					rosType: "Error",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			assetInstanceId: "",
			executionContext: {
				type: 3,
				className: "SleepNode",
				target: "",
			},
			configuration: {
				node_namespace: "gateway",
				sleep_time: "1",
				node_deployment_host: "127.0.0.1:8500",
				is_remote: "false",
				x: "1478.9649207510477",
				y: "-66.48059490330094",
				node_width: "280",
				height: "150",
			},
			resourceVersion: 0,
			history: [],
		},
		{
			id: "kMkySlOb",
			name: "Sleep Node_6",
			type: 2,
			description: "Sleeps for the configured number of seconds, then triggers the next node.",
			tags: ["Sleep", "MISC"],
			inputs: {
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				stop: {
					rosType: "Stop",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			outputs: {
				error: {
					rosType: "Error",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
				start: {
					rosType: "Start",
					type: 1,
					requestTarget: "",
					defaultValue: "default",
					edgeType: 2,
				},
			},
			assetInstanceId: "",
			executionContext: {
				type: 3,
				className: "SleepNode",
				target: "",
			},
			configuration: {
				node_namespace: "gateway",
				sleep_time: "1",
				node_deployment_host: "127.0.0.1:8500",
				is_remote: "false",
				x: "1519.1186712396516",
				y: "627.9430900172614",
				node_width: "280",
				height: "150",
			},
			resourceVersion: 0,
			history: [],
		},
	],
	edges: [
		{
			id: "i2Ld1Yd2",
			sourceNodeId: "6gUg3nmc",
			sourceOutputKey: "start",
			targetNodeId: "uUK2SYPp",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
		{
			id: "0oP4jy95",
			sourceNodeId: "wK75TtuL",
			sourceOutputKey: "start",
			targetNodeId: "6gUg3nmc",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
		{
			id: "E3NAfYpV",
			sourceNodeId: "_ksuIt8E",
			sourceOutputKey: "start",
			targetNodeId: "6gUg3nmc",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
		{
			id: "ECNMQS8Q",
			sourceNodeId: "uUK2SYPp",
			sourceOutputKey: "if_false",
			targetNodeId: "FJFyljHA",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
		{
			id: "vgkeZpGv",
			sourceNodeId: "FJFyljHA",
			sourceOutputKey: "start",
			targetNodeId: "wK75TtuL",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
		{
			id: "PD5VNAQ1",
			sourceNodeId: "uUK2SYPp",
			sourceOutputKey: "if_true",
			targetNodeId: "kMkySlOb",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
		{
			id: "sUlHOzSn",
			sourceNodeId: "kMkySlOb",
			sourceOutputKey: "start",
			targetNodeId: "_ksuIt8E",
			targetInputKey: "start",
			type: 2,
			label: "",
			description: "",
		},
	],
	childNodeGraphs: [],
	resourceVersion: 1,
	history: [],
	selectedEdgeLocation: "neura-cloud-dev-edge-001",
	programConfig: {
		isRemote: false,
		deploymentHost: "",
	},
	startNodeId: "6gUg3nmc",
} satisfies ProgramDocument;

export type ProgramNode = {
	id: string;
	name: string;
	className: string;
	emitToHmi: boolean;
	configuration?: Record<string, string>;
	maps?: { in: string[]; out: string[] };
};

export type ProgramSnapshot = {
	id: string;
	name: string;
	startNodeId: string;
	nodes: ProgramNode[];
	data: {
		maps: Array<{ nodeId: string; in: string[]; out: string[] }>;
		wires: Array<{ from: string; to: string }>;
	};
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringMap(value: unknown): Record<string, string> {
	if (!isRecord(value)) return {};
	return Object.fromEntries(
		Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
	);
}

function dataPortKeys(ports: unknown): string[] {
	if (!isRecord(ports)) return [];
	return Object.entries(ports)
		.filter(([, port]) => isRecord(port) && Number(port.edgeType) === DATA_EDGE_TYPE)
		.map(([key]) => key);
}

export function programFromGraph(graph: ProgramDocument): ProgramSnapshot {
	const maps: ProgramSnapshot["data"]["maps"] = [];
	const nodes: ProgramNode[] = [];

	for (const raw of graph.nodes ?? []) {
		if (!isRecord(raw)) continue;
		const configuration = stringMap(raw.configuration);
		const execution = isRecord(raw.executionContext) ? raw.executionContext : {};
		const ins = dataPortKeys(raw.inputs);
		const outs = dataPortKeys(raw.outputs);
		const node: ProgramNode = {
			id: String(raw.id ?? ""),
			name: String(raw.name ?? ""),
			className: String(execution.className ?? ""),
			emitToHmi: configuration.emit_to_hmi === "true",
			configuration: Object.fromEntries(
				Object.entries(configuration).filter(([key]) => UI_CONFIG_KEYS.has(key)),
			),
		};
		if (ins.length > 0 || outs.length > 0) {
			node.maps = { in: ins, out: outs };
			maps.push({ nodeId: node.id, in: ins, out: outs });
		}
		nodes.push(node);
	}

	return {
		id: graph.id,
		name: String(graph.name ?? graph.id),
		startNodeId: String(graph.startNodeId ?? ""),
		nodes,
		data: { maps, wires: [] },
	};
}

/** Operator cards. Built from {@link GRAPH}, not a second source of truth. */
export const PROGRAM = programFromGraph(GRAPH);

export function nodeInfo(node: ProgramNode): string {
	if (node.className === "SleepNode") {
		const seconds = node.configuration?.sleep_time ?? "1";
		const unit = seconds === "1" || seconds === "1.0" ? "second" : "seconds";
		return `Starts with a ${seconds} ${unit} sleep.`;
	}
	if (node.className === "IfNode") {
		const expression = node.configuration?.expression?.trim();
		if (expression) return `Branches when ${expression}.`;
		const dataPort = node.maps?.in[0] ?? "Data";
		return `Branches on ${dataPort} (true → if_true, false → if_false).`;
	}
	return "";
}

export function logicalNodeId(nodeId: string): string {
	const parts = nodeId.split(":");
	return parts.length > 1 ? parts.slice(1).join(":") : nodeId;
}

export function matchProgramNode(runtimeNodeId: string): ProgramNode | undefined {
	const logical = logicalNodeId(runtimeNodeId);
	return PROGRAM.nodes.find(
		(node) =>
			node.id === runtimeNodeId || node.id === logical || runtimeNodeId.endsWith(node.id),
	);
}
