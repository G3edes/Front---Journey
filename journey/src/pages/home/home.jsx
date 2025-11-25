import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import "./home.css";
import {
  FaPlus,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaAngleLeft,
  FaAngleRight,
  FaCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const [grupos, setGrupos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [activeDay, setActiveDay] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const BASE_URL = "http://localhost:3030/v1/journey";
  const usuarioLocal =
    user ?? JSON.parse(localStorage.getItem("journey_user") || "null");

  // ===============================
  // FETCH GRUPOS E EVENTOS
  // ===============================
  const fetchData = useCallback(async () => {
    try {
      const [gruposRes, eventosRes] = await Promise.all([
        fetch(`${BASE_URL}/group`),
        fetch(`${BASE_URL}/calendario`),
      ]);
      const gruposData = await gruposRes.json();
      const eventosData = await eventosRes.json();
      setGrupos(gruposData.grupos || []);
      setEventos(eventosData.Calendario || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================
  // FUNÇÕES DO CALENDÁRIO
  // ===============================
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const nextMonth = () =>
    month === 11
      ? (setMonth(0), setYear((prev) => prev + 1))
      : setMonth((prev) => prev + 1);
  const prevMonth = () =>
    month === 0
      ? (setMonth(11), setYear((prev) => prev - 1))
      : setMonth((prev) => prev - 1);

  const today = new Date();
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const daysArray = [];
  for (let i = firstDay; i > 0; i--) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  const eventsForActiveDay = eventos.filter((ev) => {
    const d = new Date(ev.data_evento);
    return (
      d.getDate() === activeDay &&
      d.getMonth() === month &&
      d.getFullYear() === year
    );
  });

  const deleteEvent = async (eventToDelete) => {
    const id = Number(eventToDelete.id_calendario);
    if (!id) return alert("ID inválido!");
    try {
      await fetch(`${BASE_URL}/calendario/${id}`, { method: "DELETE" });
      setEventos((prev) => prev.filter((e) => e.id_calendario !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  // ===============================
  // PERFIL / CABEÇALHO
  // ===============================
  const toggleDarkMode = () => toggleTheme();
  const goToProfile = () => navigate("/perfil");
  const handleCreateGroup = () => navigate("/criarGrupo");
  const userImage = usuarioLocal?.foto_perfil || null;

  // ===============================
  // CONTEÚDO DO CALENDÁRIO FUNCIONAL (para o painel da direita)
  // ===============================
  const calendarioFuncional = (
    <div className="calendar">
      <div className="calendar-header">
        <h2>Calendário</h2>
        <div className="navs">
          <FaAngleLeft onClick={prevMonth} />
          <FaAngleRight onClick={nextMonth} />
        </div>
      </div>

      <div className="month-display">
        {months[month]} {year}
      </div>

      <div className="calendar-grid">
        {weekdays.map((d, i) => (
          <div key={i} className="calendar-weekday">
            {d}
          </div>
        ))}

        {daysArray.map((day, idx) =>
          day ? (
            <div
              key={idx}
              className={`calendar-day ${
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
                  ? "today"
                  : ""
              } ${activeDay === day ? "active" : ""} ${
                eventos.some((ev) => {
                  const d = new Date(ev.data_evento);
                  return (
                    d.getDate() === day &&
                    d.getMonth() === month &&
                    d.getFullYear() === year
                  );
                }) ? "has-event" : ""
              }`}
              onClick={() => setActiveDay(day)}
            >
              {day}
              {eventos.some((ev) => {
                const d = new Date(ev.data_evento);
                return (
                  d.getDate() === day &&
                  d.getMonth() === month &&
                  d.getFullYear() === year
                );
              }) && <FaCircle size={6} style={{ color: "var(--primary)" }} />}
            </div>
          ) : (
            <div key={idx}></div>
          )
        )}
      </div>

      <div className="today-events">
        <h4>Eventos do dia</h4>
        {eventsForActiveDay.length > 0 ? (
          eventsForActiveDay.map((ev) => (
            <div key={ev.id_calendario} className="event">
              <div className="event-title">
                <FaCircle size={8} /> {ev.nome_evento}
              </div>
              <div className="event-time">
                {new Date(ev.data_evento).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="no-event">Sem eventos para este dia.</p>
        )}
      </div>
    </div>
  );

  // ===============================
  // JSX PRINCIPAL
  // ===============================
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.documentElement.style.backgroundColor = '#0f1114';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.style.backgroundColor = '#f5f7fb';
    }
    
    return () => {
      document.body.classList.remove('dark-theme');
      document.documentElement.style.backgroundColor = '';
    };
  }, [theme]);

  return (
    <div className={`homepage ${theme === 'dark' ? 'dark' : ''}`}>
      <DashboardLayout showRight rightContent={calendarioFuncional}>
        <header className="page-header">
          <h1 className="home-title">Bem-vindo!</h1>
          <div className="header-right">
            <button className="profile-avatar-circle" onClick={goToProfile}>
              {userImage ? (
                <img
                  src={userImage}
                  alt="Perfil"
                  className="profile-avatar-img"
                />
              ) : (
                <FaUserCircle size={26} />
              )}
            </button>
            <button className="theme-btn" onClick={toggleDarkMode}>
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </header>

        <div className="content-two-col">
          <section className="left-col">
            <div className="filters-bar">
              <div className="filter-chip">Área ▾</div>
            </div>

            <section className="page-card">
              <div className="big-card-top">
                <h2>Explorar Grupos</h2>
                <div className="big-card-actions">
                  <button className="btn btn-primary" onClick={handleCreateGroup}>
                    <FaPlus /> Criar Grupo
                  </button>
                </div>
              </div>

              <div className="big-card-body">
                {grupos.length > 0 ? (
                  <div className="groups-grid modern">
                    {grupos.map((g, idx) => (
                      <div
                        key={g.id_grupo}
                        className={`group-card modern variant-${(idx % 3) + 1}`}
                        onClick={() => navigate("/grupo", { state: g })}
                      >
                        <div className="illustration">
                          <img
                            src={
                              g.imagem ||
                              "https://cdn-icons-png.flaticon.com/512/2965/2965879.png"
                            }
                            alt={g.nome}
                          />
                        </div>
                        <div className="group-info">
                          <div className="group-title">{g.nome}</div>
                          <div className="group-desc">
                            {g.descricao ||
                              "Explore conteúdo, eventos e conversas deste grupo."}
                          </div>
                          <div className="group-meta">
                            Criado por <span>{g.criador || g.nome_criador}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="state-msg">Nenhum grupo encontrado.</div>
                )}
              </div>
            </section>
          </section>
        </div>
      </DashboardLayout>
    </div>
  );
}