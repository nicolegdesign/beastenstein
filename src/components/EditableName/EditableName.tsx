import React, { useState, useEffect, useRef } from 'react';
import { useBeastName } from '../../hooks/useBeastName';
import './EditableName.css';

interface EditableNameProps {
  initialName?: string;
  onNameChange?: (name: string) => void;
  beastId?: string;
}

export const EditableName: React.FC<EditableNameProps> = ({ 
  initialName = 'Emi', 
  onNameChange,
  beastId
}) => {
  const [name, setName] = useState(initialName);
  const spanRef = useRef<HTMLSpanElement>(null);
  const { getBeastName, setBeastName } = useBeastName();

  useEffect(() => {
    // Load saved name from centralized state if beastId is provided
    if (beastId) {
      const savedName = getBeastName(beastId) || initialName;
      setName(savedName);
    } else {
      setName(initialName);
    }
  }, [initialName, beastId, getBeastName]);

  const handleBlur = () => {
    const newName = spanRef.current?.textContent?.trim() || initialName;
    setName(newName);
    
    // Save to centralized state with beastId-specific key
    if (beastId) {
      setBeastName(beastId, newName);
    }
    
    onNameChange?.(newName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      spanRef.current?.blur();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const cleanText = text.replace(/\n/g, ' ').trim();
    document.execCommand('insertText', false, cleanText);
  };

  return (
    <div className="name-plate">
      <span 
        ref={spanRef}
        id="beast-name" 
        contentEditable="true" 
        className="editable-name"
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        suppressContentEditableWarning={true}
      >
        {name}
      </span>
    </div>
  );
};
