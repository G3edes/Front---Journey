// src/pages/perfil/PublicProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import BackButton from "../../components/ui/BackButton";
import { FaUserCircle } from "react-icons/fa";
import { FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";

const API_BASE = "http://localhost:3030/v1/journey";

export default function PublicProfile() {
  const { id_usuario } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/usuario/${id_usuario}`);
        const data = await res.json();
        const u = Array.isArray(data?.usuario) ? data.usuario[0] : data?.usuario || null;
        setUser(u);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id_usuario]);

  if (loading) return (
    <DashboardLayout>
      <div className="container-home"><div className="state-msg">Carregando perfil...</div></div>
    </DashboardLayout>
  );

  if (!user) return (
    <DashboardLayout>
      <div className="container-home"><div className="state-msg">Usuário não encontrado.</div></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="container-home">
        <section className="big-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: "linear-gradient(135deg, #6C4AE2 0%, #8F7BFF 100%)",
            height: 140,
            width: '100%'
          }} />

          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
            <div style={{ marginTop: -90 }}>
              <div style={{
                width: 180,
                height: 180,
                borderRadius: 20,
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--bg-body)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '4px solid #fff'
              }}>
                {user.foto_perfil ? (
                  <img src={user.foto_perfil} alt={user.nome_completo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FaUserCircle size={120} style={{ opacity: 0.75 }} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="home-title" style={{ margin: 0 }}>{user.nome_completo || 'Usuário'}</h1>
                {user.tipo_usuario && (
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(108,74,226,0.1)',
                    color: '#6C4AE2',
                    fontWeight: 600,
                    fontSize: 12
                  }}>
                    {user.tipo_usuario}
                  </span>
                )}
              </div>

              {user.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                  <FiMail />
                  <span>{user.email}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 12 }}>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 16,
                  background: 'var(--bg-card)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FiUser />
                    <strong>Sobre</strong>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text)' }}>
                    {user.descricao && String(user.descricao).trim().length > 0
                      ? user.descricao
                      : 'Sem descrição ainda.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {String(me?.id_usuario) !== String(id_usuario) && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/chat/privado/${id_usuario}`)}
                >
                  Chamar para conversar
                </button>
              )}
              <BackButton onClick={() => navigate(-1)} />
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
