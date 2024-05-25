import { useRef, useState } from 'react';
import './App.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { isMobile } from 'react-device-detect';

import { formatCNPJ } from './components/formats';
import { validateCNPJ } from './components/validateRules';
import CnpjInfo from './components/cnpjInfo';

function App() {
  const recaptcha = useRef();
  const cnpjInputRef = useRef();
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState(null);
  const [isCnpjValid, setIsCnpjValid] = useState(true);

  const backendUrl = 'http://localhost:8000';

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
      }

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
        {!isMobile && (
          <div className="recaptcha-container">
            <ReCAPTCHA ref={recaptcha} sitekey={process.env.REACT_APP_SITE_KEY} />
          </div>
        )}
      </form>
      {cnpjData && <CnpjInfo cnpjData={cnpjData}/>}
    </div>
  );
}

export default App;
