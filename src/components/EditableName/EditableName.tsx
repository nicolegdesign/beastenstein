import React, { useState, useEffect, useRef } from 'react';
import './EditableName.css';

interface EditableNameProps {
  initialName?: string;
  onNameChange?: (name: string) => void;
}

export const EditableName: React.FC<EditableNameProps> = ({ 
  initialName = 'Emi', 
  onNameChange 
}) => {
  const [name, setName] = useState(initialName);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Load saved name from localStorage
    const savedName = localStorage.getItem('petName') || initialName;
    setName(savedName);
  }, [initialName]);

  const handleBlur = () => {
    const newName = spanRef.current?.textContent?.trim() || initialName;
    setName(newName);
    localStorage.setItem('petName', newName);
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
    <span 
      ref={spanRef}
      id="pet-name" 
      contentEditable="true" 
      className="editable-name"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      suppressContentEditableWarning={true}
    >
      {name}
    </span>
  );
};
