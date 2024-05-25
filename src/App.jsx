import { useRef, useState } from 'react';
import './App.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { isMobile } from 'react-device-detect';

//import { FormatCnpj } from './components/Formats';
//import { validateCNPJ } from './components/ValidateRules';
//import CnpjInfo from './components/CnpjInfo';

const CnpjInfo = ({ cnpjData }) => {
  if (!cnpjData) {
    return null
  }
  
  return (<div className='cnpj-info text-white'>
    <h2>Informações do CNPJ: {cnpjData.cnpj}</h2>
    <p><strong>Status:</strong> {cnpjData.status}</p>
    <p><strong>Nome:</strong> {cnpjData.nome}</p>
    <p><strong>Fantasia:</strong> {cnpjData.fantasia}</p>
    <p><strong>Abertura:</strong> {cnpjData.abertura}</p>
    <p><strong>Telefone:</strong> {cnpjData.telefone}</p>
    {cnpjData.email && <p><strong>Email:</strong> {cnpjData.email}</p>}
    <p><strong>Endereço:</strong> {cnpjData.logradouro}, {cnpjData.numero} <br /> {cnpjData.municipio}, {cnpjData.bairro} ({cnpjData.uf})</p>
  </div>);
}

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

function FormatCnpj (value) {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

function App() {
  const recaptcha = useRef();
  const cnpjInputRef = useRef();
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState(null);
  const [isCnpjValid, setIsCnpjValid] = useState(true);

  const backendUrl = 'http://localhost:8000';

  const handleChange = (event) => {
    let formattedCNPJ = FormatCnpj(event.target.value);
    setCnpj(formattedCNPJ);
    setIsCnpjValid(validateCNPJ(formattedCNPJ.replace(/\D/g, '')));
  };

  async function submitForm(event) {
    event.preventDefault();
    let captchaValue = recaptcha.current ? recaptcha.current.getValue() : null;
    // if (!isMobile && !captchaValue) {
    if(!captchaValue){
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
      // if (!isMobile) {
        const verifyResponse = await fetch(`${backendUrl}/verify`, {
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
      //}

      let res = await fetch(`${backendUrl}/cnpj/${cnpjQuery}`);
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
    <div className="container bg-black text-white">
      <h1 className='mt-10 text-[#4eef4e]'>
        RCZ <span className='text-white'>|</span> CNPJ
      </h1>

      <form onSubmit={submitForm} className='border border-solid border-white md:p-10 md:w-[27vw]'>
        <input
          name="Cnpj"
          type="text"
          value={cnpj}
          required
          placeholder="00.000.000/0000-00"
          onChange={handleChange}
          inputMode="tel"
          ref={cnpjInputRef}
          className='bg-black text-white'
        />
        {!isCnpjValid ? (
          <p className="error-message">Por favor, insira um CNPJ válido.</p>
        ) : (
          <p className="empty-message">&nbsp;</p>
        )}
        <button type="submit">Pesquisar</button>
        {/* {!isMobile && ( */}
          <div className="recaptcha-container">
            <ReCAPTCHA ref={recaptcha} sitekey={process.env.REACT_APP_SITE_KEY} />
          </div>
        {/* )} */}
      </form>
      {cnpjData && <CnpjInfo cnpjData={cnpjData}/>}
    </div>
  );
}

export default App;
