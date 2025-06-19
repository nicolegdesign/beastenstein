import React, { useState, useEffect, useRef } from 'react';
import './EditableName.css';

interface EditableNameProps {
  initialName?: string;
  onNameChange?: (name: string) => void;
  petId?: string;
}

export const EditableName: React.FC<EditableNameProps> = ({ 
  initialName = 'Emi', 
  onNameChange,
  petId
}) => {
  const [name, setName] = useState(initialName);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Load saved name from localStorage if petId is provided
    if (petId) {
      const savedName = localStorage.getItem(`petName_${petId}`) || initialName;
      setName(savedName);
    } else {
      setName(initialName);
    }
  }, [initialName, petId]);

  const handleBlur = () => {
    const newName = spanRef.current?.textContent?.trim() || initialName;
    setName(newName);
    
    // Save to localStorage with petId-specific key
    if (petId) {
      localStorage.setItem(`petName_${petId}`, newName);
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
    </div>
  );
};
