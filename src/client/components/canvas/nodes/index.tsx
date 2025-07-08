import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Textarea } from '@/components/ui/textarea';

const TextNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as { content?: string };

  return (
    <div
      className={`min-w-[200px] rounded-lg border bg-white p-3 shadow-sm ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Input handle - where connections come in */}
      <Handle
        className="!bg-gray-400 h-3 w-3 border-2 border-white"
        position={Position.Top}
        type="target"
      />

      <Handle
        className="!bg-gray-400 h-3 w-3 border-2 border-white"
        position={Position.Bottom}
        type="source"
      />

      {/* Text input */}
      <Textarea
        className="min-h-[80px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
        placeholder="Enter text..."
        readOnly
        value={nodeData?.content || ''}
      />
    </div>
  );
};

export const nodeTypes = {
  text: TextNode,
};
