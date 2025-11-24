import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/header/index.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./grupoBase.css";
import "./grupoHome.css";
import { useTheme } from "../../context/ThemeContext";

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

  // restaura grupo salvo se veio vazio
  useEffect(() => {
    if (!state) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setGrupo(JSON.parse(saved));
    }
  }, [state]);

  // 👉 CARREGA O GRUPO DA API PARA PEGAR O NOME DO CRIADOR
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
        console.log("Erro loadGrupo:", e);
      }
    }

    loadGrupo();
  }, [grupo?.id_grupo]);

  // verifica status do usuario com o grupo
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

  return (
    <div className={`grupo-page ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar isCollapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className={`main-area ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="grupo-home-container">

          <div className="grupo-header">
            <div className="header-info">
              <h1>{grupo.nome}</h1>
            </div>
            <button className="btn btn-voltar" onClick={() => navigate("/home")}>
              ← Voltar
            </button>
          </div>

          <div className="grupo-content">
            <div className="grupo-image page-card">
              <img src={grupo.imagem || placeholder} alt={grupo.nome} />
            </div>

            <div className="grupo-info page-card">
              <h3>Sobre o grupo</h3>
              <p>{grupo.descricao || "Sem descrição."}</p>

              <div className="info-stats">
                <div><strong>Criador:</strong> {grupo.nome_criador}</div>
                <div><strong>ID:</strong> {grupo.id_grupo}</div>
              </div>

              <div className="action-area">
                {relation === "nenhum" && (
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
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
                    }}
                  >
                    Participar do Grupo
                  </button>
                )}

                {(relation === "participante" || relation === "criador") && (
                  <button className="btn btn-primary" onClick={() => navigate("/grupo-home")}>
                    Entrar no Grupo
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
