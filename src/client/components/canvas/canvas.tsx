import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useOnViewportChange,
  useReactFlow,
  Background,
  type Edge,
  type Node,
  type Viewport,
  // type ReactFlowProps
} from '@xyflow/react'
import { NodeOperationsProvider } from '@/components/canvas/node'
import { ConnectionLine } from '@/components/canvas/connection-line'
import { ZoomSlider } from '@/components/canvas/zoom-slider'
import { Toolbar } from '@/components/canvas/toolbar'
import { useState, useCallback } from 'react'

import { Doc } from '@/lib/api';

export function Canvas({
  document,
  children,
}:{
  document: Doc<'documents'>
  children?: React.ReactNode
}) {

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(document.canvas.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(document.canvas.edges);
  const [viewport, setViewport] = useState<Viewport>({x: 0, y: 0, zoom: 1})

  useOnViewportChange({
    onEnd: (viewport) => {
      console.log('onEnd', viewport)
    },
  })

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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
