import { useRef, useState } from 'react'
import './App.css'
import ReCAPTCHA from 'react-google-recaptcha'

function App() {
  const recaptcha = useRef()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  return (
    <div>
      <h1>Sign up for Newsletter</h1>
      <form>
        <input
          name="Email"
          type={'email'}
          value={email}
          required
          placeholder="joe@example.com"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          name="Name"
          type={'name'}
          value={name}
          required
          placeholder="Joe"
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Sign up</button>
        <ReCAPTCHA ref={recaptcha} sitekey={process.env.REACT_APP_SITE_KEY} />
      </form>
    </div>
  )
}

export default App