// Credenciais da API Instagram
const INSTAGRAM_API_TOKEN = 'IGAAYZAnYlsQgdBZAGI2Q1hhaEFpbXB6ZATcwWmVQMzhPNjZAwQXZAPQnFUWnVrYjNTeUpfQmxuUEFDeE5GMHJyZAkNJY3I1emhwUVU4NGhnY3Y0dGJ1STZANeG1Gb1BTakgzdXVoaVhyZA2E1cEg5bkUybWxQb2w0eGh2SXd2Y0I2bkdUawZDZD';
const USER_ID = '17140113309414121';
const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.instagram.com/${API_VERSION}`;

// Função para buscar dados da API Instagram
async function fetchInstagramAPI(endpoint, params = {}) {
  try {
    const queryParams = new URLSearchParams({
      access_token: INSTAGRAM_API_TOKEN,
      ...params
    });

    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    console.log('Buscando:', endpoint);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    return null;
  }
}

// Buscar informações da conta
export async function getAccountInfo() {
  try {
    const response = await fetchInstagramAPI(`/${USER_ID}`, {
      fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,ig_id,website'
    });
    return response;
  } catch (error) {
    console.error('Erro ao buscar informações da conta:', error);
    return null;
  }
}

// Buscar insights da conta (requer webhook)
export async function getAccountInsights() {
  try {
    const response = await fetchInstagramAPI(`/${USER_ID}/insights`, {
      metric: 'impressions,reach,profile_views,follower_count',
      period: 'day'
    });
    return response;
  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    return null;
  }
}

// Buscar media da conta
export async function getMedias(limit = 10) {
  try {
    const response = await fetchInstagramAPI(`/${USER_ID}/media`, {
      fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
      limit: limit
    });
    return response?.data || [];
  } catch (error) {
    console.error('Erro ao buscar media:', error);
    return [];
  }
}

// Buscar insights de media específica
export async function getMediaInsights(mediaId) {
  try {
    const response = await fetchInstagramAPI(`/${mediaId}/insights`, {
      metric: 'engagement,impressions,reach,saved'
    });
    return response?.data || [];
  } catch (error) {
    console.error('Erro ao buscar insights de media:', error);
    return [];
  }
}

// Buscar stories (se disponível)
export async function getStories() {
  try {
    const response = await fetchInstagramAPI(`/${USER_ID}/stories`, {
      fields: 'id,media_type,media_url,timestamp'
    });
    return response?.data || [];
  } catch (error) {
    console.error('Erro ao buscar stories:', error);
    return [];
  }
}

// Buscar reels (se disponível)
export async function getReels() {
  try {
    const response = await fetchInstagramAPI(`/${USER_ID}/media`, {
      fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
      media_type: 'REELS'
    });
    return response?.data || [];
  } catch (error) {
    console.error('Erro ao buscar reels:', error);
    return [];
  }
}

// Buscar crescimento de seguidores (histórico)
export async function getFollowerGrowth() {
  try {
    const response = await fetchInstagramAPI(`/${USER_ID}/insights`, {
      metric: 'follower_count',
      period: 'day',
      since: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) // Últimos 7 dias
    });
    return response?.data || [];
  } catch (error) {
    console.error('Erro ao buscar crescimento:', error);
    return [];
  }
}

// Função auxiliar para processar dados de insights
export function processInsights(data) {
  if (!data || !data.data) return {};

  const insights = {};
  data.data.forEach(item => {
    insights[item.name] = item.values[0]?.value || 0;
  });
  return insights;
}
