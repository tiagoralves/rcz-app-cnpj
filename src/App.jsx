import { useRef, useState } from 'react';
import './App.css';
import ReCAPTCHA from 'react-google-recaptcha';

function App() {
  const recaptcha = useRef();
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState(null); // Novo estado

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const handleChange = (event) => {
    const formattedCNPJ = formatCNPJ(event.target.value);
    setCnpj(formattedCNPJ);
  };

  async function submitForm(event) {
    event.preventDefault();
    const captchaValue = recaptcha.current.getValue();
    if (!captchaValue) {
      alert('❗❗ Por favor assinale o campo de validação.');
    } else {
      try {
        const verifyResponse = await fetch('http://localhost:8000/verify', {
          method: 'POST',
          body: JSON.stringify({ captchaValue }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          const cnpjQuery = cnpj.replace(/[^\d]+/g, '');
          const res = await fetch(`http://localhost:8000/cnpj/${cnpjQuery}`);
          const data = await res.json();
          if (res.ok) {
            console.log('Dados do CNPJ:', data);
            setCnpjData(data); // Armazena os dados do CNPJ
            alert('✅ Dados do CNPJ recebidos com sucesso!');
          } else {
            throw new Error(data.message || 'Erro ao buscar dados do CNPJ');
          }
        } else {
          alert('⚠️ ERRO na validação de reCaptcha ⚠️');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit form. Please try again later.');
      }
    }
  }

  return (
    <div>
      <h1>Formulário</h1>
      <form onSubmit={submitForm}>
        <input
          name="Email"
          type="email"
          value={email}
          //required
          placeholder="nome@example.com"
          onChange={(event) => setEmail(event.target.value)}
          inputMode="email"
        />
        <input
          name="Cnpj"
          type="text"
          value={cnpj}
          required
          placeholder="00.000.000/0000-00"
          onChange={handleChange}
          inputMode="tel"
        />
        <button type="submit">Pesquisar</button>
        <ReCAPTCHA ref={recaptcha} sitekey={process.env.REACT_APP_SITE_KEY} />
      </form>
      {cnpjData && (
        <div>
          <h2>Informações do CNPJ</h2>
          <p><strong>Nome:</strong> {cnpjData.nome}</p>
          <p><strong>Fantasia:</strong> {cnpjData.fantasia}</p>
          <p><strong>Abertura:</strong> {cnpjData.abertura}</p>
          <p><strong>Status:</strong> {cnpjData.status}</p>
          <p><strong>Tipo:</strong> {cnpjData.tipo}</p>
          <p><strong>Telefone:</strong> {cnpjData.telefone}</p>
          <p><strong>Email:</strong> {cnpjData.email}</p>
          <p><strong>Atividade Principal:</strong> {cnpjData.atividade_principal[0].text}</p>
          {/* Adicione outros campos conforme necessário */}
        </div>
      )}
    </div>
  );
}

export default App;
