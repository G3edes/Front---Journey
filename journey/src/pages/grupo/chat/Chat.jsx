import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import DashboardLayout from "../../../components/layouts/DashboardLayout.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { FiSend, FiImage, FiPaperclip, FiSmile, FiMoreVertical, FiArrowLeft } from 'react-icons/fi';
import "../grupoBase.css";
import "./chat.css";

// URLs de conexão
const SOCKET_URL = "http://localhost:3030";
const API_URL = "http://localhost:3030/v1/journey";
const socket = io(SOCKET_URL);

// chave pro localStorage
const STORAGE_KEY = "journey_grupo_atual";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [grupo, setGrupo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [idChatRoom, setIdChatRoom] = useState(null);
  const chatEndRef = useRef(null);

  // imagem padrão para avatar
  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ------------------------------
  // Carrega grupo do localStorage
  // ------------------------------
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
      buscarSalaDeGrupo(grupoSalvo.id_grupo);
    }
  }, [navigate, user.id_usuario]);

  // ------------------------------
  // Receber mensagens pelo socket
  // ------------------------------
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // normaliza estrutura da mensagem recebida do socket
      const normalizada = {
        id_chat_room: data.id_chat_room ?? data.chatId ?? idChatRoom,
        id_usuario: data.id_usuario ?? data.userId ?? data.usuario_id,
        conteudo: data.conteudo ?? data.texto ?? "",
        autor: data.autor ?? data.userName ?? (data.usuario?.nome_completo || "Usuário"),
        avatar: data.avatar ?? data.usuario?.foto_perfil ?? DEFAULT_AVATAR,
        hora:
          data.hora ||
          (data.enviado_em
            ? new Date(data.enviado_em).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
      };

      setMensagens((prev) => {
        // evita mensagens duplicadas por hora+conteudo+autor
        if (!prev.some((m) => m.hora === normalizada.hora && m.conteudo === normalizada.conteudo && String(m.id_usuario) === String(normalizada.id_usuario))) {
          return [...prev, normalizada];
        }
        return prev;
      });
    });

    return () => socket.off("receive_message");
  }, []);

  // ------------------------------
  // Buscar sala do grupo
  // ------------------------------
  const buscarSalaDeGrupo = async (id_grupo) => {
    try {
      const res = await fetch(`${API_URL}/group/chat-room/${id_grupo}`);
      if (!res.ok) throw new Error(`Erro ${res.status} ao buscar sala`);
      const data = await res.json();

      if (data?.grupo?.chat_room) {
        const sala = data.grupo.chat_room;
        setIdChatRoom(sala.id_chat_room);
        socket.emit("join_room", sala.id_chat_room);
        console.log("✅ Entrou na sala:", sala.id_chat_room);

        // busca histórico de mensagens
        const mensagensRes = await fetch(`${API_URL}/chatroom/${sala.id_chat_room}/mensagens`);
        const mensagensData = await mensagensRes.json();
        if (mensagensData?.mensagens) {
          const mensagensFormatadas = mensagensData.mensagens.map((m) => ({
            id_chat_room: m.id_chat_room,
            id_usuario: m.id_usuario,
            conteudo: m.conteudo,
            autor: m.usuario?.nome_completo || "Usuário",
            avatar: m.usuario?.foto_perfil || DEFAULT_AVATAR,
            hora: new Date(m.enviado_em).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }));
        
          setMensagens(mensagensFormatadas);
        }
        
      } else {
        console.warn("Nenhuma sala encontrada para o grupo");
      }
    } catch (error) {
      console.error("Erro buscarSalaDeGrupo:", error);
    }
  };

  // ------------------------------
  // Cria ou busca sala privada
  // ------------------------------
  const obterOuCriarSalaPrivada = async (id_usuario1, id_usuario2) => {
    try {
      const res = await fetch(`${API_URL}/chat-room/privado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario1, id_usuario2 }),
      });

      const data = await res.json();
      if (data?.sala?.id_chat_room) {
        const idSala = data.sala.id_chat_room;
        setIdChatRoom(idSala);
        socket.emit("join_room", idSala);

        // busca histórico de mensagens
        const mensagensRes = await fetch(`${API_URL}/chatroom/${idSala}/mensagens`);
        const mensagensData = await mensagensRes.json();
        if (mensagensData?.mensagens) {
          const mensagensFormatadas = mensagensData.mensagens.map((m) => ({
            id_chat_room: m.id_chat_room,
            id_usuario: m.id_usuario,
            conteudo: m.conteudo,
            autor: m.usuario?.nome_completo || "Usuário",
            avatar: m.usuario?.foto_perfil || DEFAULT_AVATAR,
            hora: new Date(m.enviado_em).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }));
        
          setMensagens(mensagensFormatadas);
        }
        
      }
    } catch (error) {
      console.error("Erro obterOuCriarSalaPrivada:", error);
    }
  };

  // ------------------------------
  // Enviar mensagem
  // ------------------------------
  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim() || !idChatRoom) return;

    const novaMensagem = {
      id_chat_room: idChatRoom,
      id_usuario: user.id_usuario,
      conteudo: mensagem,
      autor: user?.nome_completo || "Você",
      avatar: user?.foto_perfil || DEFAULT_AVATAR,
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("send_message", novaMensagem);
    setMensagem("");
  };

  // Scroll automático ao fim
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ------------------------------
  // Renderização
  // ------------------------------
  return (
    <DashboardLayout noPadding showRight={false}>
      <div className="chat-layout">
        <section className="chat-wrapper">
          <div className="chat-header">
            <button 
              className="back-button" 
              onClick={() => navigate("/grupo-home")}
              aria-label="Voltar"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="header-content">
              <h1>{grupo?.nome || "Chat"}</h1>
              <p>
                <span className="status-dot"></span>
                {grupo?.tipo_chat === "privado" ? "Conversa privada" : `${grupo?.total_membros || 0} membros online`}
              </p>
            </div>
          </div>

          <div className="chat-box">
            <div className="mensagens-container">
              {mensagens.length > 0 ? (
                mensagens.map((msg, index) => {
                  const isCurrentUser = String(msg.id_usuario) === String(user.id_usuario);
                  return (
                    <div
                      key={`${msg.id_usuario}-${index}-${msg.hora}`}
                      className={`mensagem ${isCurrentUser ? 'minha' : 'outro'}`}
                    >
                      <img
                        src={msg.avatar || DEFAULT_AVATAR}
                        alt={msg.autor}
                        className="avatar"
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="mensagem-bubble">
                        {!isCurrentUser && (
                          <span className="sender-name">
                            {msg.autor}
                          </span>
                        )}
                        <p>{msg.conteudo}</p>
                        <span className="message-time">
                          {msg.hora}
                          {isCurrentUser && (
                            <span className="message-status">✓✓</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="sem-mensagens">
                  <p>Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="chat-input-container">
            <form onSubmit={enviarMensagem} className="chat-input-wrapper">
              <div className="chat-actions">
                <button 
                  type="button" 
                  className="icon-button"
                  data-tooltip="Anexar imagem"
                >
                  <FiImage />
                </button>
                <button 
                  type="button" 
                  className="icon-button"
                  data-tooltip="Anexar arquivo"
                >
                  <FiPaperclip />
                </button>
                <button 
                  type="button" 
                  className="icon-button"
                  data-tooltip="Emojis"
                >
                  <FiSmile />
                </button>
              </div>
              <textarea
                className="chat-input"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
                disabled={!idChatRoom}
                rows="1"
                onInput={(e) => {
                  // Ajusta a altura do textarea conforme o conteúdo
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!mensagem.trim() || !idChatRoom}
                data-tooltip="Enviar mensagem"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
