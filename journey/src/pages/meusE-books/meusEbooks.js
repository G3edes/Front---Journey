const comprar = async () => {
    try {
      const response = await fetch(
        "http://localhost:3030/v1/journey/ebook/comprar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: localStorage.getItem("id_usuario"),
            id_ebooks: ebook.id_ebooks
          })
        }
      );
  
      const data = await response.json();
  
      if (data.status) {
        alert("Compra realizada com sucesso!");
        window.location.reload(); // força atualizar comprados
      } else {
        alert(data.message);
      }
  
    } catch (err) {
      console.error("Erro ao comprar:", err);
    }
  };
  