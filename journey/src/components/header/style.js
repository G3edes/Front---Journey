// components/header/style.js
import styled from "styled-components";

// 0. UserAvatar Component
export const UserAvatar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
  transition: all 0.3s ease;
  overflow: hidden;

  img {
    width: 100%;
    max-width: 120px;
    height: auto;
    object-fit: contain;
  }

  ${({ isCollapsed }) =>
    isCollapsed &&
    `
    img {
      max-width: 40px;
    }
  `}
`;

// 1. SidebarToggle (Posicionado no fundo e com largura ajustada)
export const SidebarToggle = styled.button`
  position: relative;
  bottom: 25px;
  left: 50%;

  @media (max-width: 768px) {
    display: none;
  }
  transform: translateX(-50%);
  background: #5c46b5;
  color: white;
  border: none;
  border-radius: 8px;
  width: 50px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  font-size: 16px;
  z-index: 1001;

  [data-theme="dark"] & {
    background: #3f3f46;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }
`;

// 2. SidebarContainer (Fixo)
export const SidebarContainer = styled.aside`
  width: ${({ isCollapsed }) => (isCollapsed ? "80px" : "220px")};
  background-color: #2c1e92;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 15px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: all 0.3s ease;
  z-index: 1000;

  @media (max-width: 768px) {
    transform: ${({ isCollapsed }) =>
      isCollapsed ? "translateX(-100%)" : "translateX(0)"};
    width: 260px;
    z-index: 999;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);

    &.open {
      transform: translateX(0);
    }
  }

  [data-theme="dark"] & {
    background-color: #151719;
  }

  ${({ isCollapsed }) =>
    isCollapsed &&
    `
      ${UserAvatar} {
          opacity: 0;
          transition: opacity 0.3s ease;
          margin-bottom: 0px;
      }
  `}
`;

// ... (restante do código permanece o mesmo)

// 3. Menu (Com flex-grow para empurrar o toggle)
export const Menu = styled.div`
  background: linear-gradient(180deg, #3b2cb0 0%, #2c1e92 100%);
  width: 100%;
  border-radius: 12px;
  padding: 14px;
  flex-grow: 1;
  margin-bottom: auto;
  transition: all 0.3s ease;

  [data-theme="dark"] & {
    background: linear-gradient(180deg, #1b1d20 0%, #151719 100%);
  }

  ${({ isCollapsed }) =>
    isCollapsed &&
    `
    padding: 10px 0;
  `}
`;
export const MenuItem = styled.div`
  display: flex;
  justify-content: ${({ isCollapsed }) =>
    isCollapsed ? "center" : "flex-start"};
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Esconde o texto quando colapsado */
  p,
  a,
  span {
    display: ${({ isCollapsed }) => (isCollapsed ? "none" : "block")};
    opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
    transition: opacity 0.3s ease;
  }

  svg {
    font-size: 20px;
  }
`;
