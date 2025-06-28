import { 
  Handle, 
  Position, 
  type NodeProps
} from '@xyflow/react';
import { Textarea } from '@/components/ui/textarea';

const TextNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as { content?: string };
  
  return (
    <div className={`min-w-[200px] bg-white border rounded-lg shadow-sm p-3 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Input handle - where connections come in */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      
      {/* Text input */}
      <Textarea
        value={nodeData?.content || ''}
        placeholder="Enter text..."
        className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 shadow-none"
        readOnly
      />
      
    </div>
  );
};

export const nodeTypes = {
  text: TextNode,
}; 