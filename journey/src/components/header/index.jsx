import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/logo.png";
import "./sidebarStyles.css";

import {
  SidebarContainer,
  UserAvatar,
  Menu,
  MenuItem,
  SidebarToggle,
} from "./style.js";

import {
  FaPlus,
  FaUsers,
  FaComments,
  FaBook,
  FaAngleLeft,
  FaAngleRight,
  FaHome,
  FaCalendar,
  FaCar,
  FaCarBattery,
  FaCarAlt,
  FaCartPlus,
} from "react-icons/fa";

const Sidebar = ({ isCollapsed, setCollapsed, onItemClick }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <SidebarContainer 
      className="sidebar-container"
      isCollapsed={isCollapsed}
      data-theme={theme}
    >
      <UserAvatar>
        <img src={logo} alt="Logo" />
      </UserAvatar>

      <Menu isCollapsed={isCollapsed}>
        <MenuItem 
          isCollapsed={isCollapsed} 
          onClick={(e) => {
            e.stopPropagation();
            navigate("/home");
            onItemClick && onItemClick();
          }}
        >
          <FaHome />
          <span>Home</span>
        </MenuItem>

        <MenuItem
          isCollapsed={isCollapsed}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/meus-grupos");
            onItemClick && onItemClick();
          }}
        >
          <FaUsers />
          <span>Meus Grupos</span>
        </MenuItem>

        <MenuItem
          isCollapsed={isCollapsed}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/criarGrupo");
            onItemClick && onItemClick();
          }}
        >
          <FaPlus />
          <span>Criar Grupo</span>
        </MenuItem>

        <MenuItem isCollapsed={isCollapsed} onClick={(e) => {
          e.stopPropagation();
          navigate("/chat");
          onItemClick && onItemClick();
        }}>
          <FaComments />
          <span>Chats</span>
        </MenuItem>

        <MenuItem isCollapsed={isCollapsed} onClick={(e) => {
          e.stopPropagation();
          navigate("/ebook");
          onItemClick && onItemClick();
        }}>
          <FaBook />
          <span>E-Books</span>
        </MenuItem>
        <MenuItem 
          isCollapsed={isCollapsed} 
          onClick={(e) => {
            e.stopPropagation();
            navigate("/home");
            onItemClick && onItemClick();
          }}
        >
          <FaCartPlus />
          <span>Seu Carrinho</span>
        </MenuItem>
      </Menu>

      <MenuItem isCollapsed={isCollapsed} onClick={(e) => {
          e.stopPropagation();
          navigate("/chat");
          onItemClick && onItemClick();
        }}>
          <FaComments />
          <span>Meus E-books</span>
        </MenuItem>

      <SidebarToggle
        isCollapsed={isCollapsed}
        onClick={() => setCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
      </SidebarToggle>
    </SidebarContainer>
  );
};

export default Sidebar;
