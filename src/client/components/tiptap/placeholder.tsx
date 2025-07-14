import Placeholder from '@tiptap/extension-placeholder';

export const PlaceholderExtension = Placeholder.configure({
  placeholder: (props) => {
    const { node, pos, editor } = props;
    const $pos = editor.view.state.doc.resolve(pos);

    if (node.type.name === 'heading') {
      return `Heading ${node.attrs.level}`;
    }

    // If we're in a paragraph, check if its parent is a taskItem
    if (node.type.name === 'paragraph' && $pos.parent.type.name === 'taskItem') {
      return 'Checklist';
    }
    
    // Check if we're in a paragraph inside a regular listItem
    if (node.type.name === 'paragraph' && $pos.parent.type.name === 'listItem') {
      return 'List';
    }

    if (node.type.name === 'paragraph' && $pos.parent.type.name === 'blockquote') {
      return 'Quote';
    }

    return "Use '@' to reference, '/' for commands";
  },
  includeChildren: true,
  showOnlyCurrent: true,
  showOnlyWhenEditable: true,
});