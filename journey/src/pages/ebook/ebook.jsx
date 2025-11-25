import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/header/index.jsx";
import { useTheme } from "../../context/ThemeContext";
import bannerImage from "../../assets/livro.png";
import {
  Container,
  Header,
  Banner,
  BannerText,
  BannerImage,
  Section,
  SectionHeader,
  CardGrid,
  BookCard,
  BookImage,
  BookInfo,
  RightPanel,
  AchievementCard,
  SalesList,
  SalesItem,
} from "./ebook.js";

const API_URL = "http://localhost:3030/v1/journey/ebook";

export default function Ebook() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();

      if (Array.isArray(data.ebooks)) {
        setEbooks(data.ebooks);
      } else {
        throw new Error("Formato inesperado da resposta da API");
      }
    } catch (err) {
      console.error("Falha ao carregar ebooks:", err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor) || 0);

  const ProgressBar = ({ progress, label, days }) => (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          height: "8px",
          width: "100%",
          background: "var(--border-color)",
          borderRadius: "6px",
          overflow: "hidden",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "8px",
            background: "#6f42f7",
          }}
        ></div>
      </div>
      <small style={{ color: "var(--text-muted)" }}>
        {label} — <span>{days}</span>
      </small>
    </div>
  );

  const handleCadastrarEbook = () => navigate("/cadastrar-ebook");

  const handleAbrirEbook = (ebook) =>
    navigate(`/ebook/${ebook.id_ebooks}`, { state: ebook });

  return (
    <div
      className={`homepage ${theme === "dark" ? "dark" : ""}`}
      style={{ display: "flex" }}
    >
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <Container $isCollapsed={sidebarCollapsed}>
        <Header>
          <input
            className="search"
            type="text"
            placeholder="Pesquisar e-books..."
          />
          <div className="user-actions">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="User Avatar"
              className="avatar"
            />
          </div>
        </Header>

        <Banner>
          <BannerText>
            <h2>E-Books</h2>
            <p>
              Explore o acervo de e-books disponíveis na plataforma Journey e
              descubra novos aprendizados.
            </p>
            <button onClick={handleCadastrarEbook}>Cadastrar E-book</button>
          </BannerText>
          <BannerImage src={bannerImage} alt="Books Illustration" />
        </Banner>

        <div style={{ display: "flex", gap: "30px", marginTop: "40px" }}>
          {/* LISTA DE EBOOKS */}
          <div style={{ flex: 3 }}>
            <Section>
              <SectionHeader>
                <h3>Todos os E-books</h3>
                <span onClick={fetchEbooks} style={{ cursor: "pointer" }}>
                  Recarregar
                </span>
              </SectionHeader>

              {loading ? (
                <p>Carregando e-books...</p>
              ) : error ? (
                <p style={{ color: "red" }}>Erro: {error}</p>
              ) : ebooks.length === 0 ? (
                <p>Nenhum e-book encontrado.</p>
              ) : (
                <CardGrid>
                  {ebooks.map((book) => {
                    const descricaoCompleta =
                      book.descricao || "Sem descrição disponível.";
                    const descricaoCurta =
                      descricaoCompleta.length > 120
                        ? descricaoCompleta.substring(0, 120) + "..."
                        : descricaoCompleta;

                    return (
                      <BookCard
                        key={book.id_ebooks}
                        onClick={() => handleAbrirEbook(book)}
                        style={{
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.02)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <BookImage
                          src={
                            book.link_imagem ||
                            "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
                          }
                          alt={book.titulo}
                        />
                        <BookInfo>
                          <h4>{book.titulo}</h4>

                          <p>
                            {expandedDescriptions[book.id_ebooks]
                              ? descricaoCompleta
                              : descricaoCurta}
                          </p>

                          {descricaoCompleta.length > 120 && (
                            <small
                              style={{
                                color: "var(--primary)",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDescription(book.id_ebooks);
                              }}
                            >
                              {expandedDescriptions[book.id_ebooks]
                                ? "Ler menos"
                                : "Ler mais"}
                            </small>
                          )}

                          <small style={{ color: "var(--text-muted)" }}>
                            Autor:{" "}
                            {book.usuario?.nome_completo || "Desconhecido"}
                          </small>

                          {book.categoriasEbooks?.length > 0 && (
                            <div style={{ marginTop: "6px" }}>
                              <small style={{ color: "var(--text-muted)" }}>
                                Categorias:{" "}
                                {book.categoriasEbooks
                                  .map((c) => c.categoria?.categoria)
                                  .join(", ")}
                              </small>
                            </div>
                          )}

                          <div style={{ marginTop: "10px" }}>
                            <small
                              style={{
                                color: "var(--text-color)",
                                fontWeight: "600",
                              }}
                            >
                              💰 {formatarPreco(book.preco)}
                            </small>
                          </div>
                        </BookInfo>
                      </BookCard>
                    );
                  })}
                </CardGrid>
              )}
            </Section>
          </div>

          {/* PAINEL DIREITO */}
          <RightPanel>
            <AchievementCard>
              <h4>Progresso de Leitura</h4>
              <ProgressBar
                progress={50}
                label="50% Lidos"
                days="7 Dias restantes"
              />
              <ProgressBar
                progress={80}
                label="80% Concluído"
                days="2 Dias restantes"
              />
            </AchievementCard>

            <SalesList>
              <h4>Ultimos Lancamentos</h4>
              {ebooks.slice(0, 3).map((book, i) => (
                <SalesItem key={i}>
                  <div>
                    <img
                      src={
                        book.link_imagem ||
                        "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
                      }
                      alt={book.titulo}
                    />
                    <div>
                      <p>{book.titulo}</p>
                      <small>{formatarPreco(book.preco)}</small>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(book.link_arquivo_pdf, "_blank")}
                  >
                    Ler
                  </button>
                </SalesItem>
              ))}
            </SalesList>
          </RightPanel>
        </div>
      </Container>
    </div>
  );
}
