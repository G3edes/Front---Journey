import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import DashboardLayout from "../../../components/layouts/DashboardLayout.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { FiSend, FiImage, FiPaperclip, FiSmile, FiArrowLeft } from 'react-icons/fi';
import "../grupoBase.css";
import "./chat.css";

const SOCKET_URL = "http://localhost:3030";
const API_URL = "http://localhost:3030/v1/journey";
const socket = io(SOCKET_URL);

const STORAGE_KEY = "journey_grupo_atual";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [grupo, setGrupo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [idChatRoom, setIdChatRoom] = useState(null);
  const chatEndRef = useRef(null);

  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Carrega grupo salvo
  useEffect(() => {
    const grupoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!grupoSalvo) {
      navigate("/home", { replace: true });
      return;
    }

    setGrupo(grupoSalvo);
    setMensagens([]);

    if (grupoSalvo.tipo_chat === "privado") {
      obterOuCriarSalaPrivada(user.id_usuario, grupoSalvo.id_usuario_destino);
    } else {
      // 🚀 Sala de grupo = id do próprio grupo
      const idSala = grupoSalvo.id_grupo;
      setIdChatRoom(idSala);
      socket.emit("join_room", idSala);

      buscarMensagensDaSala(idSala);
    }
  }, [navigate, user.id_usuario]);

  // Receber mensagens via socket
  useEffect(() => {
    socket.on("receive_message", (data) => {
      const normalizada = {
        id_chat_room: data.id_chat_room,
        id_usuario: data.id_usuario ?? data.userId,
        conteudo: data.conteudo,
        autor: data.autor || data.userName || "Usuário",
        avatar: data.avatar || DEFAULT_AVATAR,
        hora:
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      setMensagens((prev) => [...prev, normalizada]);
    });

    return () => socket.off("receive_message");
  }, []);

  // Buscar mensagens da sala
  const buscarMensagensDaSala = async (idSala) => {
    try {
      const res = await fetch(`${API_URL}/chatroom/${idSala}/mensagens`);
      const data = await res.json();

      if (data?.mensagens) {
        const msgs = data.mensagens.map((m) => ({
          id_chat_room: m.id_chat_room,
          id_usuario: m.id_usuario,
          conteudo: m.conteudo,
          autor: m.usuario?.nome_completo || "Usuário",
          avatar: m.usuario?.foto_perfil || DEFAULT_AVATAR,
          hora: new Date(m.enviado_em).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMensagens(msgs);
      }
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  };

  // Criar ou pegar sala privada
  const obterOuCriarSalaPrivada = async (u1, u2) => {
    try {
      const res = await fetch(`${API_URL}/chat-room/privado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario1: u1, id_usuario2: u2 }),
      });

      const data = await res.json();

      if (data?.sala?.id_chat_room) {
        const idSala = data.sala.id_chat_room;
        setIdChatRoom(idSala);
        socket.emit("join_room", idSala);
        buscarMensagensDaSala(idSala);
      }
    } catch (err) {
      console.error("Erro sala privada:", err);
    }
  };

  // Enviar mensagem
  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim() || !idChatRoom) return;

    const novaMsg = {
      id_chat_room: idChatRoom,
      id_usuario: user.id_usuario,
      conteudo: mensagem,
      autor: user?.nome_completo,
      avatar: user?.foto_perfil || DEFAULT_AVATAR,
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("send_message", novaMsg);
    setMensagem("");
  };

  // Scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  return (
    <DashboardLayout noPadding showRight={false}>
      <div className="chat-layout">
        <section className="chat-wrapper">
          <div className="chat-header">
            <button className="back-button" onClick={() => navigate("/grupo-home")}>
              <FiArrowLeft size={20} />
            </button>
            <div className="header-content">
              <h1>{grupo?.nome}</h1>
              <p>
                <span className="status-dot"></span>
                {grupo?.tipo_chat === "privado"
                  ? "Conversa privada"
                  : `${grupo?.total_membros || 0} membros online`}
              </p>
            </div>
          </div>

          <div className="chat-box">
            <div className="mensagens-container">
              {mensagens.map((msg, i) => {
                const minha = String(msg.id_usuario) === String(user.id_usuario);
                return (
                  <div key={i} className={`mensagem ${minha ? "minha" : "outro"}`}>
                    <img src={msg.avatar} className="avatar" />
                    <div className="mensagem-bubble">
                      {!minha && <span className="sender-name">{msg.autor}</span>}
                      <p>{msg.conteudo}</p>
                      <span className="message-time">{msg.hora}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="chat-input-container">
            <form onSubmit={enviarMensagem} className="chat-input-wrapper">
              <textarea
                className="chat-input"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
                disabled={!idChatRoom}
              />
              <button className="send-button" disabled={!mensagem.trim()}>
                <FiSend />
              </button>
            </form>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
