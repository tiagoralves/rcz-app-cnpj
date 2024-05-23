import { useRef, useState } from 'react';
import './App.css';
import ReCAPTCHA from 'react-google-recaptcha';

function App() {
  const recaptcha = useRef();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  async function submitForm(event) {
    event.preventDefault();
    const captchaValue = recaptcha.current.getValue();
    if (!captchaValue) {
      alert('❗❗ Por favor assinale o campo de validação.');
    } else {
      try {
        const res = await fetch('http://localhost:8000/verify', {
          method: 'POST',
          body: JSON.stringify({ captchaValue }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        if (data.success) {
          alert('✅ Requisição feita com Suesso!!');
        } else {
          alert('⚠️ ERRO na vlidação de reCaptcha ⚠️');
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
          required
          placeholder="joe@example.com"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          name="Name"
          type="text"
          value={name}
          required
          placeholder="Joe"
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Sign up</button>
        <ReCAPTCHA ref={recaptcha} sitekey={process.env.REACT_APP_SITE_KEY} />
      </form>
    </div>
  );
}

export default App;
