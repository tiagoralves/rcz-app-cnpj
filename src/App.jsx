import { useRef, useState } from 'react';
import './App.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { isMobile } from 'react-device-detect';

function App() {
  const recaptcha = useRef();
  const cnpjInputRef = useRef();
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState(null);
  const [isCnpjValid, setIsCnpjValid] = useState(true);
  

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj === '') return false;

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
  };

  const handleChange = (event) => {
    let formattedCNPJ = formatCNPJ(event.target.value);
    setCnpj(formattedCNPJ);
    setIsCnpjValid(validateCNPJ(formattedCNPJ.replace(/\D/g, '')));
  };

  async function submitForm(event) {
    event.preventDefault();
     let captchaValue = recaptcha.current ? recaptcha.current.getValue() : null;
    if (!isMobile && !captchaValue) {
      alert('❗❗ Por favor assinale o campo de validação.');
      return;
    }

    let cnpjQuery = cnpj.replace(/\D/g, '');
    if (cnpjQuery.length !== 14) {
      alert('❗❗ Por favor, insira um CNPJ válido com 14 dígitos.');
      cnpjInputRef.current.focus();
      return;
    }

    if (!validateCNPJ(cnpjQuery)) {
      alert('❗❗ O CNPJ inserido é inválido. Por favor, insira um CNPJ válido.');
      cnpjInputRef.current.focus();
      return;
    }

    try {
      if (!isMobile) {
        const verifyResponse = await fetch('http://localhost:8000/verify', {
          method: 'POST',
          body: JSON.stringify({ captchaValue }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const verifyData = await verifyResponse.json();
        if (!verifyData.success) {
          alert('⚠️ ERRO na validação de reCaptcha ⚠️');
          return;
        }
      }

      let res = await fetch(`http://localhost:8000/cnpj/${cnpjQuery}`);
      let data = await res.json();
      if (res.ok) {
        console.log('Dados do CNPJ:', data);
        setCnpjData(data);
      } else {
        throw new Error(data.message || 'Erro ao buscar dados do CNPJ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit form. Please try again later.');
    }
  }

  return (
    <div>
      <h1 className='mt-10'>RCZ  |  CNPJ</h1>
      <form onSubmit={submitForm}>
        <input
          name="Cnpj"
          type="text"
          value={cnpj}
          required
          placeholder="00.000.000/0000-00"
          onChange={handleChange}
          inputMode="tel"
          ref={cnpjInputRef}
        />
        {!isCnpjValid ? (
            <p className="error-message">Por favor, insira um CNPJ válido.</p>
          ) : (
            <p className="empty-message">&nbsp;</p>
          )}
        <button type="submit">Pesquisar</button>
       {!isMobile && (
          <div className="recaptcha-container">
            <ReCAPTCHA ref={recaptcha} sitekey={process.env.REACT_APP_SITE_KEY} />
          </div>
        )}
      </form>
      {cnpjData && (
        <div className='cnpj-info'>
          <h2>Informações do CNPJ: {cnpjData.cnpj}</h2>
          <p><strong>Status:</strong> {cnpjData.status}</p>
          <p><strong>Nome:</strong> {cnpjData.nome}</p>
          <p><strong>Fantasia:</strong> {cnpjData.fantasia}</p>
          <p><strong>Abertura:</strong> {cnpjData.abertura}</p>
          <p><strong>Telefone:</strong> {cnpjData.telefone}</p>
          {cnpjData.email && <p><strong>Email:</strong> {cnpjData.email}</p>}
          <p><strong>Endereço:</strong> {cnpjData.logradouro}, {cnpjData.numero} - {cnpjData.bairro} ({cnpjData.uf})</p>
        </div>
      )}
    </div>
  );
}

export default App;
