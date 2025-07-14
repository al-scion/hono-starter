import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Viewport,
} from '@xyflow/react';
import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';
import { ConnectionLine } from '@/components/canvas/connection-line';
import { NodeOperationsProvider } from '@/components/canvas/node';
import { nodeTypes } from '@/components/canvas/nodes';
import { Toolbar } from '@/components/canvas/toolbar';
import { ZoomSlider } from '@/components/canvas/zoom-slider';
import { convexApi, type Doc } from '@/lib/api';

export function Canvas({
  agent,
  children,
}: {
  agent: Doc<'agents'>;
  children?: React.ReactNode;
}) {
  const updateCanvas = useMutation(convexApi.agent.updateCanvas);

  const [nodes, setNodes, _onNodesChange] = useNodesState<Node>(
    agent.canvas.nodes
  );
  const [edges, setEdges, _onEdgesChange] = useEdgesState<Edge>(
    agent.canvas.edges
  );
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      setNodes((current) => {
        const updatedNodes = applyNodeChanges(changes, current);
        updateCanvas({
          agentId: agent._id,
          nodes: updatedNodes,
          edges,
        });
        return updatedNodes;
      });
    },
    [agent._id, edges, updateCanvas, setNodes]
  );

  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      setEdges((current) => {
        const updatedEdges = applyEdgeChanges(changes, current);
        updateCanvas({
          agentId: agent._id,
          nodes,
          edges: updatedEdges,
        });
        return updatedEdges;
      });
    },
    [agent._id, nodes, updateCanvas, setEdges]
  );

  const { getNode } = useReactFlow();

  const onConnect = useCallback((_params: any) => {}, []);

  const addNode = useCallback(
    (type: string, options?: Record<string, unknown>) => {
      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        data: {},
        position: { x: 0, y: 0 },
        draggable: true,
        ...options,
      };
      setNodes((nodes: Node[]) => nodes.concat(newNode));
      return newNode.id;
    },
    [setNodes]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (!node?.type) {
        return;
      }
      addNode(node.type, {
        ...node,
        id: crypto.randomUUID(),
        selected: true,
        position: {
          x: node.position.x + 100,
          y: node.position.y + 100,
        },
      });
    },
    [addNode, getNode]
  );

  return (
    <NodeOperationsProvider addNode={addNode} duplicateNode={duplicateNode}>
      <ReactFlow
        className=""
        connectionLineComponent={ConnectionLine}
        edges={edges}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onEdgesChange={handleEdgesChange}
        onNodesChange={handleNodesChange}
        onViewportChange={setViewport}
        panOnDrag={[1, 2]}
        panOnScroll={true}
        proOptions={{ hideAttribution: true }}
        selectionOnDrag={true}
        snapGrid={[10, 10]}
        snapToGrid={true}
        viewport={viewport}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Toolbar />
        <ZoomSlider />
        {children}
      </ReactFlow>
    </NodeOperationsProvider>
  );
}
