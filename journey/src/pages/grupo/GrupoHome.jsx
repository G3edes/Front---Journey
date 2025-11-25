// src/pages/grupo/GrupoHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUsers, 
  FaCalendarAlt, 
  FaEdit, 
  FaComment, 
  FaUser, 
  FaPlus,
  FaClock,
  FaInfoCircle
} from "react-icons/fa";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";
import BackButton from '../../components/ui/BackButton';
import "./grupoHome.css";

const STORAGE_KEY = "journey_grupo_atual";

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

export default function GrupoHome() {
  const [grupo, setGrupo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [participantes, setParticipantes] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isCreator = useMemo(() => {
    if (!grupo || !user) return false;
    return (
      String(user.id_usuario) ===
      String(grupo?.id_criador || grupo?.id_usuario_criador || grupo?.criador_id || "")
    );
  }, [grupo, user]);

  useEffect(() => {
    const fetchParticipantes = async () => {
      if (!grupo?.id_grupo) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3030'}/v1/journey/group/${grupo.id_grupo}/participantes`);
        const data = await res.json();
        setParticipantes(data?.total || 0);
      } catch (error) {
        console.error("Erro ao carregar participantes:", error);
      }
    };

    fetchParticipantes();
  }, [grupo]);

  useEffect(() => {
    const grupoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!grupoSalvo) {
      navigate("/home", { replace: true });
      return;
    }
    setGrupo(grupoSalvo);
    setCarregando(false);
  }, [navigate]);

  const handleNavigate = (path) => {
    if (path === "/calendary") {
      try {
        localStorage.setItem("group_id", JSON.stringify({ id_grupo: grupo.id_grupo }));
      } catch {}
    }
    navigate(path);
  };

  const actionButtons = [
    {
      icon: <FaComment />,
      label: "Chat",
      path: "/grupo/chat",
      variant: "primary",
      description: "Converse com os membros do grupo"
    },
    {
      icon: <FaCalendarAlt />,
      label: "Calendário",
      path: "/calendary",
      description: "Veja os eventos agendados"
    },
    {
      icon: <FaUsers />,
      label: `Participantes (${participantes})`,
      path: "/grupo/participantes",
      description: "Veja quem faz parte do grupo"
    }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleActionClick = (action) => {
    if (action.scroll) {
      scrollToSection(action.path);
    } else {
      handleNavigate(action.path);
    }
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Carregando grupo...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!grupo) return null;

  // Format creation date
  const dataCriacao = new Date(grupo.data_criacao || new Date());
  const dataFormatada = dataCriacao.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`grupo-page ${theme}`}>
      <DashboardLayout>
        <motion.div 
          className="grupo-home-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            className="grupo-header" 
            variants={itemVariants}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}
          >
            <BackButton 
              className="outline"
              style={{
                margin: 0,
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 500,
                minWidth: '100px'
              }}
            />
            
            <div className="header-actions">
              {isCreator && (
                <motion.button
                  className="btn btn-icon"
                  onClick={() => navigate("/grupo/editar")}
                  title="Editar Grupo"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEdit />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Group Banner */}
          <motion.div 
            className="grupo-banner"
            variants={itemVariants}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div 
              className="grupo-avatar"
              animate={isHovered ? { y: -5 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={
                  grupo.imagem ||
                  "https://cdn-icons-png.flaticon.com/512/2965/2965879.png"
                }
                alt={grupo.nome}
                className="grupo-avatar-img"
              />
            </motion.div>
            <div className="grupo-header-info">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {grupo.nome}
              </motion.h1>
              <div className="grupo-meta">
                <span>
                  <FaUser /> Criado por: {grupo.nome_criador || "Criador desconhecido"}
                </span>
                <span>
                  <FaUsers /> {participantes} {participantes === 1 ? 'membro' : 'membros'}
                </span>
                <span>
                  <FaClock /> Criado em {dataFormatada}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="quick-actions" variants={containerVariants}>
            {actionButtons.map((action, index) => (
              <motion.button
                key={index}
                className={`action-btn ${action.variant || ''}`}
                onClick={() => handleActionClick(action)}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                title={action.description}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
                {action.description && (
                  <span className="action-tooltip">{action.description}</span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* About Group */}
          <motion.div 
            id="sobre"
            className="page-card" 
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>
              <FaInfoCircle /> Sobre o Grupo
            </h2>
            <div className="grupo-descricao">
              {grupo.descricao || (
                <div className="empty-state">
                  <p>Este grupo ainda não possui uma descrição.</p>
                  {isCreator && (
                    <button 
                      className="btn btn-text"
                      onClick={() => navigate("/grupo/editar")}
                    >
                      <FaEdit /> Adicionar descrição
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="grupo-detalhes">
              <div className="detalhe-item">
                <span className="detalhe-label">Data de Criação</span>
                <span>{dataFormatada}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Tipo de Grupo</span>
                <span>{grupo.tipo || "Geral"}</span>
              </div>
              {grupo.regras && (
                <div className="detalhe-item">
                  <span className="detalhe-label">Regras</span>
                  <span>{grupo.regras}</span>
                </div>
              )}
            </div>
          </motion.div>

          

          
        
        </motion.div>
      </DashboardLayout>
    </div>
  );
}
