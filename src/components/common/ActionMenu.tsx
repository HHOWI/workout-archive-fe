import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";

interface ActionMenuItem {
  label: string;
  onClick: () => void;
  color?: string;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

const ActionMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  color: #333;
  line-height: 1;

  &:focus {
    outline: none;
  }
`;

const MenuContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 120px;
  z-index: 1000;
  overflow: hidden;
`;

const MenuItem = styled.button<{ color?: string }>`
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  color: ${(props) => props.color || "#333"};

  &:hover {
    background-color: #f8f8f8;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f1f1;
  }
`;

const ActionMenu: React.FC<ActionMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 메뉴 외부 클릭 감지하여 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 액션 항목 클릭시 처리
  const handleItemClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <ActionMenuContainer ref={menuRef}>
      <ActionButton onClick={toggleMenu}>⋯</ActionButton>

      {isOpen && (
        <MenuContainer>
          {items.map((item, index) => (
            <MenuItem
              key={index}
              color={item.color}
              onClick={() => handleItemClick(item.onClick)}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuContainer>
      )}
    </ActionMenuContainer>
  );
};

export default ActionMenu;
