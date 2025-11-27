

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import BackButton from "../../components/ui/BackButton";

const API_URL = "http://localhost:3030/v1/journey";

export default function ParticipantesGrupo() {
  const { user } = useAuth();
  const [participantes, setParticipantes] = useState([]);
  const [grupo, setGrupo] = useState(null);

  useEffect(() => {
    const g = JSON.parse(localStorage.getItem("journey_grupo_atual") || "null");
    setGrupo(g);
    if (g?.id_grupo) carregarParticipantes(g.id_grupo);
  }, []);

  async function carregarParticipantes(id_grupo) {
    try {
      const res = await fetch(`${API_URL}/grupo/${id_grupo}/participantes`);
      const data = await res.json();
      setParticipantes(data.participantes || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function removerParticipante(id_usuario) {
    if (!grupo || !user) return;
    if (!window.confirm("Tem certeza que deseja remover este participante?")) return;

    try {
      const res = await fetch(`${API_URL}/grupo/${grupo.id_grupo}/participante/${id_usuario}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_solicitante: user.id_usuario }),
      });
      if (res.ok) {
        alert("Participante removido!");
        carregarParticipantes(grupo.id_grupo);
      } else {
        const erro = await res.json();
        alert(erro.message || "Erro ao remover participante");
      }
    } catch (e) {
      alert("Erro ao remover participante");
    }
  }

  const isCreator = grupo && String(grupo.id_usuario) === String(user.id_usuario);

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="page-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem"
          }}
        >
          <BackButton onClick={() => navigate(-1)} />
          <h2 style={{ margin: 0 }}>Participantes do Grupo</h2>
        </div>

        {participantes.length === 0 && <p>Nenhum participante encontrado.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {participantes.map((p) => (
            <li
              key={p.id_usuario}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8
              }}
            >
              <img
                src={
                  p.foto_perfil ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={p.nome_completo}
                width={40}
                height={40}
                style={{ borderRadius: "50%" }}
              />

              <span style={{ flex: 1 }}>{p.nome_completo}</span>

              {isCreator && p.id_usuario !== user.id_usuario && (
                <button
                  className="btn-remove"
                  onClick={() => removerParticipante(p.id_usuario)}
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}