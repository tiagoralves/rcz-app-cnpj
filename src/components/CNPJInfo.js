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

export default CnpjInfo;