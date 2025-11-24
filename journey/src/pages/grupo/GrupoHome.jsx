// src/pages/grupo/GrupoHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaEdit, FaComment, FaUser } from "react-icons/fa";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";
import "./grupoHome.css";

const STORAGE_KEY = "journey_grupo_atual";

export default function GrupoHome() {
  const [grupo, setGrupo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [participantes, setParticipantes] = useState(0);
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
        const res = await fetch(`http://localhost:3030/v1/journey/group/${grupo.id_grupo}/participantes`);
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
      variant: "primary"
    },
    {
      icon: <FaCalendarAlt />,
      label: "Calendário",
      path: "/calendary"
    },
    {
      icon: <FaUsers />,
      label: `Participantes (${participantes})`,
      path: "/grupo/participantes"
    }
  ];

  if (carregando) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando grupo...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!grupo) return null;

  return (
    <div className={`grupo-page ${theme}`}>
      <DashboardLayout>
        <div className="grupo-home-container">
          {/* Cabeçalho */}
          <div className="grupo-header">
            <button 
              className="btn-back"
              onClick={() => navigate("/home")}
              aria-label="Voltar"
            >
              <FaArrowLeft /> Voltar
            </button>
            
            <div className="header-actions">
              {isCreator && (
                <button
                  className="btn btn-icon"
                  onClick={() => navigate("/grupo/editar")}
                  title="Editar Grupo"
                >
                  <FaEdit />
                </button>
              )}
            </div>
          </div>

          {/* Cabeçalho do Grupo */}
          <div className="grupo-banner">
            <div className="grupo-avatar">
              <img
                src={
                  grupo.imagem ||
                  "https://cdn-icons-png.flaticon.com/512/2965/2965879.png"
                }
                alt={grupo.nome}
                className="grupo-avatar-img"
              />
            </div>
            <div className="grupo-header-info">
              <h1>{grupo.nome}</h1>
              <p className="grupo-meta">
<span><FaUser /> Criado por: {grupo.nome_criador || "Criador desconhecido"}</span>
  <span>•</span>
  <span>{participantes} {participantes === 1 ? 'membro' : 'membros'}</span>
</p>

            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="quick-actions">
            {actionButtons.map((action, index) => (
              <button
                key={index}
                className={`btn action-btn ${action.variant || ''}`}
                onClick={() => handleNavigate(action.path)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Sobre o Grupo */}
          <div className="page-card">
            <h2>Sobre o Grupo</h2>
            <div className="grupo-descricao">
              {grupo.descricao || "Este grupo ainda não possui uma descrição."}
            </div>
            
            <div className="grupo-detalhes">
              <div className="detalhe-item">
                <span className="detalhe-label">Criado em:</span>
                <span>{new Date(grupo.data_criacao || new Date()).toLocaleDateString('pt-BR')}</span>
              </div>
              
            </div>
          </div>

          {/* Seção de Atividades Recentes (pode ser expandida) */}
          <div className="page-card">
            <h2>Atividades Recentes</h2>
            <div className="empty-state">
              <p>Nenhuma atividade recente para exibir</p>
              <button 
                className="btn btn-text"
                onClick={() => navigate("/grupo/chat")}
              >
                Iniciar uma conversa
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
