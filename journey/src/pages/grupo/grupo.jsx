import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiCalendar, FiMapPin, FiMessageSquare, FiPlus, FiUser, FiGlobe, FiInfo } from "react-icons/fi";
import BackButton from '../../components/ui/BackButton';
import Sidebar from "../../components/header/index.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";

import "./grupoHome.css";
import "./grupoBase.css";
import "./grupo.css";

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

  const placeholder =
    "https://cdn-icons-png.flaticon.com/512/2965/2965879.png";

  useEffect(() => {
    if (!state) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setGrupo(JSON.parse(saved));
    }
  }, [state]);

  useEffect(() => {
    async function loadGrupo() {
      if (!grupo?.id_grupo) return;
      try {
        const resp = await fetch(`${API_URL}/group/${grupo.id_grupo}`);
        const data = await resp.json();
        if (data.status && data.grupo) {
          setGrupo(data.grupo);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.grupo));
        }
      } catch (e) {
        console.warn("Erro loadGrupo:", e);
      }
    }
    loadGrupo();
  }, [grupo?.id_grupo]);

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
          navigate("/grupo-home", { replace: true });
        }
      } catch {
        setRelation("nenhum");
      }
    }
    loadStatus();
  }, [grupo, user, navigate]);

  async function handleJoin() {
    if (!user?.id_usuario) {
      alert("Faça login para participar do grupo.");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/group/${grupo.id_grupo}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: user.id_usuario }),
      });

      if (resp.status === 409) {
        alert("Você já participa deste grupo!");
        return;
      }

      if (resp.ok) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(grupo));
        window.dispatchEvent(new Event("groupsUpdated"));
        navigate("/grupo-home", { replace: true });
      } else {
        const body = await resp.json().catch(() => ({}));
        alert(body.message || "Não foi possível participar. Tente novamente.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de rede ao tentar participar.");
    }
  }

  if (!grupo) return <div className="loading">Carregando…</div>;

  return (
    <div className={`grupo-page ${theme === "dark" ? "dark" : "light"}`}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <main className={`main-area ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="grupo-container">
          {/* Botão Voltar */}
          <BackButton />

          {/* Cabeçalho do Grupo */}
          <div className="grupo-header">
            <div className="grupo-cover">
              <div className="grupo-avatar">
                <img
                  src={grupo.imagem || placeholder}
                  alt={grupo.nome}
                  className="grupo-avatar-img"
                />
              </div>
            </div>
            
            <div className="grupo-info">
              
              
              <div className="grupo-meta">
                <span className="meta-item">
                  <FiUser className="meta-icon" />
                  {grupo.nome_criador || "Criador desconhecido"}
                </span>
                
                <span className="meta-item">
                  <FiCalendar className="meta-icon" />
                  Criado em {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="grupo-acoes">
                {relation === "nenhum" ? (
                  <button className="btn-join" onClick={handleJoin}>
                    <FiPlus className="btn-icon" />
                    Participar do Grupo
                  </button>
                ) : (
                  <button 
                    className="btn-enter"
                    onClick={() => navigate("/grupo-home")}
                  >
                    <FiMessageSquare className="btn-icon" />
                    Acessar Grupo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="grupo-conteudo">
            {/* Sobre o Grupo */}
            <div className="grupo-card">
              <h2 className="card-titulo">
                <FiInfo className="card-icon" />
                Sobre o Grupo
              </h2>
              <div className="card-conteudo">
                <p className="grupo-descricao">
                  {grupo.descricao || "Este grupo ainda não possui descrição."}
                </p>
                
                <div className="grupo-detalhes">
                  <div className="detalhe-item">
                    <span className="detalhe-label">Tipo de Grupo</span>
                    <span className="detalhe-valor">Público <FiGlobe className="inline-icon" /></span>
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Criado por</span>
                    <span className="detalhe-valor">
                      <FiUser className="inline-icon" />
                      {grupo.nome_criador || "Usuário anônimo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Membros Destaque */}
            <div className="grupo-card">
             
              <div className="card-conteudo">
                <div className="membros-lista">
                  {[1, 2, 3, 4, 5].map((membro) => (
                    <div className="membro-card" key={membro}>
                      <div className="membro-avatar">
                        <img 
                          src={`https://i.pravatar.cc/100?img=${membro}`} 
                          alt={`Membro ${membro}`} 
                        />
                        {membro === 1 && <span className="admin-badge">Admin</span>}
                      </div>
                      <span className="membro-nome">Membro {membro}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Próximos Eventos */}
            <div className="grupo-card">
              <h2 className="card-titulo">
                <FiCalendar className="card-icon" />
                Próximos Eventos
              </h2>
              <div className="card-conteudo">
                <div className="evento-card">
                  <div className="evento-data">
                    <span className="evento-dia">30</span>
                    <span className="evento-mes">NOV</span>
                  </div>
                  <div className="evento-info">
                    <h3>Encontro no Parque</h3>
                    <p>Parque Ibirapuera - 15:00</p>
                    <span className="evento-status">12 participantes confirmados</span>
                  </div>
                </div>
                
            
                
                <button className="btn-secundario">
                  Ver todos os eventos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
