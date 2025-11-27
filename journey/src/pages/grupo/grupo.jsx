import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/header/index.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";
import { FaArrowLeft, FaUsers, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import "./grupoBase.css";

const API_URL = "http://localhost:3030/v1/journey";
const STORAGE_KEY = "journey_grupo_atual";

export default function Grupo() {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grupo, setGrupo] = useState(state || null);
  const [relation, setRelation] = useState("carregando");

  const placeholder = "https://cdn-icons-png.flaticon.com/512/2965/2965879.png";

  useEffect(() => {
    if (!state) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setGrupo(JSON.parse(saved));
    }
  }, [state]);

  useEffect(() => {
    async function loadStatus() {
      if (!grupo?.id_grupo || !user?.id_usuario) return;

      try {
        const resp = await fetch(
          `${API_URL}/group/${grupo.id_grupo}/status?userId=${user.id_usuario}`
        );
        const data = await resp.json();
        const relationType = data.relation || "nenhum";
        setRelation(relationType);

        if (relationType === "participante" || relationType === "criador") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(grupo));
          navigate("/grupo-home", { replace: true });
        }
      } catch {
        setRelation("nenhum");
      }
    }

    loadStatus();
  }, [grupo, user, navigate]);

  if (!grupo)
    return (
      <div className="grupo-page">
        <Sidebar />
        <main className="main-area">
          <div className="page-card">
            <p>Grupo não encontrado</p>
            <button onClick={() => navigate("/home")}>Voltar</button>
          </div>
        </main>
      </div>
    );

  const handleJoinGroup = async () => {
    try {
      const resp = await fetch(`${API_URL}/group/${grupo.id_grupo}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: user.id_usuario })
      });

      if (resp.status === 409) {
        alert("Você já participa deste grupo!");
        return;
      }

      if (resp.ok) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(grupo));
        window.dispatchEvent(new Event("groupsUpdated"));
        navigate("/grupo-home", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      alert("Ocorreu um erro ao tentar entrar no grupo. Tente novamente.");
    }
  };

  return (
    <div className={`grupo-page ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar isCollapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className={`main-area ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="grupo-container">
          {/* Cabeçalho */}
          <div className="grupo-header">
            <button 
              className="back-button" 
              onClick={() => navigate("/home")}
              aria-label="Voltar"
            >
              <FaArrowLeft className="icon" />
              <span>Voltar</span>
            </button>
            <h1 className="grupo-title">{grupo.nome}</h1>
            <div className="header-actions">
              <span className="member-count">
                <FaUsers className="icon" />
                {grupo.total_membros || 0} membros
              </span>
            </div>
          </div>

          <div className="grupo-content">
            {/* Banner do Grupo */}
            <div className="grupo-banner">
              <div className="banner-image">
                <img 
                  src={grupo.imagem || placeholder} 
                  alt={grupo.nome} 
                  className="grupo-cover"
                />
                <div className="banner-overlay"></div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="grupo-main">
              {/* Seção de Informações */}
              <div className="grupo-card info-card">
                <h2 className="section-title">Sobre o grupo</h2>
                <p className="grupo-description">
                  {grupo.descricao || "Este grupo ainda não possui uma descrição."}
                </p>
                
                <div className="grupo-meta">
                  <div className="meta-item">
                    <FaUsers className="meta-icon" />
                    <div>
                      <span className="meta-label">Membros</span>
                      <span className="meta-value">{grupo.total_membros || 0}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <FaUserPlus className="meta-icon" />
                    <div>
                      <span className="meta-label">Criado por</span>
                      <span className="meta-value">{grupo.criador || "Usuário"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="action-buttons">
                {relation === "nenhum" ? (
                  <button 
                    className="btn btn-join"
                    onClick={handleJoinGroup}
                  >
                    <FaSignInAlt className="btn-icon" />
                    Participar do Grupo
                  </button>
                ) : (
                  <button 
                    className="btn btn-enter"
                    onClick={() => navigate("/grupo-home")}
                  >
                    <FaSignInAlt className="btn-icon" />
                    Acessar Grupo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}