import React, { useEffect, useState } from "react";
import Sidebar from "../../components/header";
import { useTheme } from "../../context/ThemeContext";

import {
  Container,
  Title,
  Subtitle,
  Grid,
  BookCard,
  BookImage,
  BookTitle,
  ReadButton
} from "./meusEbooks.js";

export default function MeusLivros() {
  const { theme } = useTheme();
  const [ebooks, setEbooks] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const id_usuario = localStorage.getItem("id_usuario");

  useEffect(() => {
    carregarMeusLivros();
  }, []);

  const carregarMeusLivros = async () => {
    try {
      const response = await fetch(
        `http://localhost:3030/v1/journey/ebook/meus-livros/${id_usuario}`
      );

      const data = await response.json();
      setEbooks(data.ebooks || []);
    } catch (err) {
      console.error("Erro ao carregar Meus Livros:", err);
    }
  };

  const abrirPDF = (ebook) => {
    if (!ebook.comprado) {
      alert("Você precisa comprar este ebook para acessar o conteúdo.");
      return;
    }

    window.open(ebook.link_arquivo_pdf, "_blank");
  };

  return (
    <div className={`homepage ${theme === "dark" ? "dark" : ""}`} style={{ display: "flex" }}>
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      <Container isCollapsed={sidebarCollapsed}>
        <Title>Meus Livros</Title>
        <Subtitle>Ebooks que você já adquiriu</Subtitle>

        <Grid>
          {ebooks.length === 0 && <p>Você ainda não comprou nenhum ebook.</p>}

          {ebooks.map((book) => (
            <BookCard key={book.id_ebooks}>
              <BookImage src={book.link_imagem} alt={book.titulo} />
              <BookTitle>{book.titulo}</BookTitle>

              <ReadButton onClick={() => abrirPDF(book)}>
                Ler Ebook
              </ReadButton>
            </BookCard>
          ))}
        </Grid>
      </Container>
    </div>
  );
}
