import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  type Edge,
  type Node,
  type Viewport,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { NodeOperationsProvider } from '@/components/canvas/node'
import { ConnectionLine } from '@/components/canvas/connection-line'
import { ZoomSlider } from '@/components/canvas/zoom-slider'
import { Toolbar } from '@/components/canvas/toolbar'
import { useState, useCallback } from 'react'

import { convexApi, Doc } from '@/lib/api';
import { useMutation } from 'convex/react';

export function Canvas({
  document,
  children,
}:{
  document: Doc<'documents'>
  children?: React.ReactNode
}) {

  const updateCanvas = useMutation(convexApi.document.updateCanvas)
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(document.canvas.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(document.canvas.edges);
  const [viewport, setViewport] = useState<Viewport>({x: 0, y: 0, zoom: 1})

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      setNodes((current) => {
        const updatedNodes = applyNodeChanges(changes, current);
        updateCanvas({
          docId: document._id,
          nodes: updatedNodes,
          edges: edges
        });
        return updatedNodes;
      });
    },
    [document._id, edges, updateCanvas]
  );

  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      setEdges((current) => {
        const updatedEdges = applyEdgeChanges(changes, current);
        updateCanvas({
          docId: document._id,
          nodes: nodes,
          edges: updatedEdges
        });
        return updatedEdges;
      });
    },
    [document._id, nodes, updateCanvas]
  )


  

  const { getNode } = useReactFlow()
  

  const onConnect = useCallback((params: any) => {
    console.log(params)
  }, [])

  const addNode = useCallback((
    type: string,
    options?: Record<string, unknown>
  ) => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      type,
      data: {},
      position: { x: 0, y: 0 },
      draggable: true,
      ...options,
    }
    setNodes((nodes: Node[]) => nodes.concat(newNode))
    return newNode.id
  }, [])

  const duplicateNode = useCallback((nodeId: string) => {
    const node = getNode(nodeId)
    if (!node || !node.type) {return}
    addNode(node.type, {
      ...node,
      id: crypto.randomUUID(),
      selected: true,
      position: {
        x: node.position.x + 100,
        y: node.position.y + 100,
      },
    })
  }, [addNode, getNode])

  return (
    <div className="flex-1">
      <NodeOperationsProvider addNode={addNode} duplicateNode={duplicateNode}>
        <ReactFlow
          proOptions={{hideAttribution: true}}
          panOnScroll={true}
          selectionOnDrag={true}
          panOnDrag={[1,2]}
          connectionLineComponent={ConnectionLine}
          onConnect={onConnect}
          nodes={nodes}
          edges={edges}
          viewport={viewport}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onViewportChange={setViewport}
          className=''
        >
          <Background color='#71717a' />
          <Toolbar />
          <ZoomSlider />
            {children}
        </ReactFlow>
      </NodeOperationsProvider>
    </div>
  )
}
