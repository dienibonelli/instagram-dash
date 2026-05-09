// ⚠️ IMPORTANTE: Copie este arquivo para 'config.js' e preencha suas credenciais
// NUNCA faça commit do arquivo config.js - ele está no .gitignore

const CONFIG = {
  // Cole aqui seu token do Instagram Graph API
  INSTAGRAM_TOKEN: 'seu_token_aqui_IGA...',

  // Seu USER_ID do Instagram
  USER_ID: '26943961181882997'
};

// Exportar para uso no dashboard
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
