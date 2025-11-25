import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import BackButton from "../../components/ui/BackButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3030/v1/journey";

export default function EditarGrupo() {
  const { id_grupo } = useParams();
  const { user: me } = useAuth();
  const [participantes, setParticipantes] = useState([]);
  const [criadorId, setCriadorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarParticipantes();
  }, [id_grupo]);

  async function carregarParticipantes() {
    try {
      const res = await fetch(`${API_URL}/grupo/${id_grupo}/participantes`);
      const data = await res.json();

      if (data && Array.isArray(data.participantes)) {
        setParticipantes(data.participantes);
        if (data.participantes.length > 0) {
          setCriadorId(data.participantes[0].id_criador); // o backend já envia o id do criador
        }
      }
    } catch (e) {
      console.error("Erro ao carregar participantes:", e);
    } finally {
      setLoading(false);
    }
  }

  async function removerParticipante(id_usuario_removido) {
  if (!window.confirm("Tem certeza que deseja remover este participante?")) return;

  try {
    const res = await fetch(`${API_URL}/grupo/remover-participante`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_grupo: Number(id_grupo),
        id_usuario_removido: Number(id_usuario_removido),
        id_usuario_logado: Number(me?.id_usuario),
      }),
    });

    const data = await res.json().catch(() => ({ message: "Resposta inválida" }));

    if (res.ok) {
      alert(data.message || "Removido com sucesso.");
      setParticipantes((prev) => prev.filter((p) => p.id_usuario !== id_usuario_removido));
    } else {
      // mostra detalhes para debug
      alert(`Erro: ${data.message || 'erro desconhecido'}`);
      console.warn("Remover participante falhou:", { status: res.status, data });
    }
  } catch (err) {
    console.error("Erro ao remover participante (fetch):", err);
    alert("Erro de rede ao tentar remover participante. Veja o console do navegador.");
  }
}


  if (loading) return (
    <DashboardLayout>
      <div className="page-card"><p>Carregando participantes...</p></div>
    </DashboardLayout>
  );

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="page-card">
        <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem'}}>
          <BackButton onClick={() => navigate(-1)} />
          <h2 style={{margin:0}}>Participantes do Grupo</h2>
        </div>

        {participantes.length === 0 && <p>Nenhum participante encontrado.</p>}

        <ul className="lista-participantes">
          {participantes.map((p) => (
            <li key={p.id_usuario} className="participante-item">
              <img
                src={p.foto_perfil || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt={p.nome_completo}
                className="foto-perfil"
              />
              <div className="info">
                <span className="nome">{p.nome_completo}</span>
                {p.id_usuario === criadorId && (
                  <span className="tag-criador">Criador</span>
                )}
              </div>

              {me?.id_usuario === criadorId && p.id_usuario !== criadorId && (
                <button
                  onClick={() => removerParticipante(p.id_usuario)}
                  className="btn btn-danger"
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
