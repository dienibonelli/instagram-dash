// ========================================
// INSTAGRAM DASHBOARD - Script Principal
// ========================================

let dashboardData = {
  reach: 0,
  engagement: 0,
  followers: 0,
  clicks: 0,
  saves: 0,
  conversionRate: 0,
  growthRate: 0,
  impressions: 0,
  saveRate: 0,
  shareRate: 0,
  qualifiedEngagement: 0,
  netFollowerGrowth: 0,
  reachGrowth: 0,
  engagementGrowth: 0,
  savesGrowth: 0,
  conversionGrowth: 0,
  avgLikes: 0,
  avgComments: 0,
  avgSaves: 0,
  saveToLikeRatio: 0
};

let dateFilter = {
  startDate: null,
  endDate: null
};

// Gerar posts de teste
function generateTestPosts() {
  const posts = [];
  const today = new Date();

  const captions = [
    '✨ Dica de marketing que vai mudar seu negócio! Aproveita que é válido por tempo limitado 🔥',
    '📈 Crescimento orgânico de 300% em 3 meses! Veja como nós conseguimos... 💪',
    '🎬 Bastidor de como criamos este conteúdo. Você já sabia dessa estratégia?',
    '📚 Tutorial completo: 5 passos para aumentar suas vendas no Instagram 💰',
    '💡 A verdade sobre o algoritmo do Instagram que ninguém fala 🤫'
  ];

  const types = ['IMAGE', 'VIDEO', 'CAROUSEL'];
  const emojis = ['📸', '🎥', '🎠', '📹', '🖼️'];

  for (let i = 0; i < 30; i++) {
    const postDate = new Date(today);
    postDate.setDate(postDate.getDate() - i);
    postDate.setHours(Math.floor(Math.random() * 24), 0, 0, 0);

    const type = types[i % types.length];
    const captionIdx = i % captions.length;

    posts.push({
      id: `post_${i}`,
      caption: captions[captionIdx],
      media_type: type,
      media_url: `https://picsum.photos/500/500?random=${i}`,
      emoji: emojis[i % emojis.length],
      timestamp: postDate.toISOString(),
      like_count: Math.floor(Math.random() * 2000) + 100,
      comments_count: Math.floor(Math.random() * 150) + 10,
      saved_count: Math.floor(Math.random() * 500) + 20
    });
  }
  return posts;
}

// Configuração da API (carregada de config.js)
const API_TOKEN = CONFIG?.INSTAGRAM_TOKEN || null;
const USER_ID = CONFIG?.USER_ID || '26943961181882997';
const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.instagram.com/${API_VERSION}`;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Cache de dados
const dataCache = new Map();

// Buscar dados reais da API (com cache e validação)
async function fetchInstagramAPI(endpoint, params = {}) {
  // Validar token
  if (!API_TOKEN) {
    console.error('❌ Token não configurado no config.js!');
    return null;
  }

  try {
    // Verificar cache
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    if (dataCache.has(cacheKey)) {
      const cached = dataCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`💾 [CACHE] ${endpoint}`);
        return cached.data;
      }
      dataCache.delete(cacheKey);
    }

    const queryParams = new URLSearchParams({
      access_token: API_TOKEN,
      ...params
    });

    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    console.log(`🔄 Chamando API: ${endpoint}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`❌ API Error (${data.error.code}): ${data.error.message}`);
      if (data.error.code === 190) {
        console.error('🔑 Token expirado ou inválido!');
      }
      return null;
    }

    // Armazenar em cache
    dataCache.set(cacheKey, { data, timestamp: Date.now() });
    console.log(`✅ Resposta recebida (em cache por 5 min)`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar API:', error.message);
    return null;
  }
}

// Mostrar/esconder loading
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('hidden');
}

// Carregar dados
async function loadInstagramData() {
  showLoading();
  const startTime = performance.now();
  console.log('🚀 Dashboard iniciando...');
  console.time('⏱️ Tempo total de carregamento');

  let posts = null;

  // Buscar dados reais da API - Cliques, Salvamentos e Seguidores
  try {
    console.log(`\n🔎 BUSCANDO DADOS DA API...`);
    console.log(`📱 USER_ID: ${USER_ID}`);

    // Tentativa 1: Buscar métricas com período diário (30 dias)
    console.log(`\n📊 Tentativa 1: Buscando insights com período 'day'...`);
    const insightsData = await fetchInstagramAPI(`/${USER_ID}/insights`, {
      metric: 'website_clicks,saved,profile_views',
      period: 'day'
    });

    if (insightsData && insightsData.data && insightsData.data.length > 0) {
      console.log(`✅ Métricas retornadas: ${insightsData.data.length}`);
      insightsData.data.forEach(metric => {
        console.log(`   - ${metric.name}: ${metric.values?.[0]?.value || 'N/A'}`);
      });

      insightsData.data.forEach(metric => {
        if (metric.name === 'website_clicks' && metric.values) {
          dashboardData.clicks = metric.values[0]?.value || 0;
          console.log(`✅ Cliques na bio: ${dashboardData.clicks}`);
        }
        if (metric.name === 'saved' && metric.values) {
          dashboardData.saves = metric.values[0]?.value || 0;
          console.log(`✅ Salvamentos: ${dashboardData.saves}`);
        }
      });
    }

    // Tentativa 2: Buscar dados básicos do perfil (inclui followers)
    console.log(`\n🔍 Tentativa 2: Buscando dados do perfil (/me)...`);
    const profileData = await fetchInstagramAPI(`/${USER_ID}`, {
      fields: 'username,name,biography,followers_count,follows_count,media_count'
    });

    if (profileData && profileData.followers_count !== undefined) {
      dashboardData.followers = profileData.followers_count || 0;
      console.log(`✅ Seguidores (API - /me): ${dashboardData.followers}`);
      console.log(`📋 Perfil: ${profileData.username} (${profileData.name})`);
    } else {
      console.warn(`⚠️ Campo 'followers_count' não retornado. Resposta:`, profileData);
    }

  } catch (error) {
    console.error('❌ Erro ao buscar dados da API:', error.message);
  }


  // Tentar carregar dados reais da API
  try {
    const mediaData = await fetchInstagramAPI(`/${USER_ID}/media`, {
      fields: 'id,caption,media_type,timestamp,like_count,comments_count,media_url',
      limit: 20
    });

    if (mediaData && mediaData.data && mediaData.data.length > 0) {
      console.log(`✅ ${mediaData.data.length} posts carregados da API do Instagram`);
      posts = mediaData.data;

      // Buscar insights (salvamentos) para cada post - EM PARALELO
      console.log('⚡ Carregando insights de salvamentos (paralelo)...');

      const insightsPromises = posts.map((post, index) =>
        fetchInstagramAPI(`/${post.id}/insights`, { metric: 'saved' })
          .then(insights => {
            if (insights && insights.data && insights.data.length > 0) {
              const savesMetric = insights.data.find(m => m.name === 'saved');
              posts[index].saved_count = savesMetric?.values[0]?.value || 0;
            } else {
              posts[index].saved_count = 0;
            }
          })
          .catch(error => {
            console.log(`⚠️ Erro ao buscar salvamentos do post ${post.id}`);
            posts[index].saved_count = 0;
          })
      );

      // Aguardar todas as chamadas em paralelo
      await Promise.all(insightsPromises);
      console.log('✅ Todos os insights carregados com sucesso (modo paralelo)');
    } else {
      console.log('⚠️ Nenhum post encontrado na API, usando dados de teste...');
      posts = generateTestPosts();
    }
  } catch (error) {
    console.log('⚠️ Erro ao carregar API, usando dados de teste...');
    posts = generateTestPosts();
  }

  // Se posts for nulo, usar dados de teste
  if (!posts) {
    console.log('⚠️ Usando dados de teste');
    posts = generateTestPosts();
  }

  // Filtrar posts para período atual e anterior
  const periodDays = Math.ceil((dateFilter.endDate - dateFilter.startDate) / (1000 * 60 * 60 * 24));
  const previousPeriodStart = new Date(dateFilter.startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousPeriodEnd = dateFilter.startDate;

  const filteredPosts = posts.filter(post => {
    const postDate = new Date(post.timestamp);
    return postDate >= dateFilter.startDate && postDate < dateFilter.endDate;
  });

  const previousPeriodPosts = posts.filter(post => {
    const postDate = new Date(post.timestamp);
    return postDate >= previousPeriodStart && postDate < previousPeriodEnd;
  });

  console.log(`\n📅 PERÍODO: ${dateFilter.startDate.toLocaleDateString('pt-BR')} até ${new Date(dateFilter.endDate.getTime() - 86400000).toLocaleDateString('pt-BR')}`);
  console.log(`✅ Posts filtrados: ${filteredPosts.length} de ${posts.length}`);

  if (filteredPosts.length > 0) {
    let totalLikes = 0;
    let totalComments = 0;
    let totalSaves = 0;
    let prevTotalLikes = 0;
    let prevTotalComments = 0;
    let prevTotalSaves = 0;

    filteredPosts.forEach((post, idx) => {
      totalLikes += post.like_count || 0;
      totalComments += post.comments_count || 0;
      totalSaves += post.saved_count || 0;

      if (idx < 3) {
        console.log(`  ${idx + 1}. ${post.caption} (${new Date(post.timestamp).toLocaleDateString('pt-BR')}) - ❤️ ${post.like_count}`);
      }
    });

    previousPeriodPosts.forEach(post => {
      prevTotalLikes += post.like_count || 0;
      prevTotalComments += post.comments_count || 0;
      prevTotalSaves += post.saved_count || 0;
    });

    // Calcular dados com base nos posts filtrados
    const avgEngagementPerPost = (totalLikes + totalComments) / filteredPosts.length;

    dashboardData.reach = Math.floor(filteredPosts.length * avgEngagementPerPost * 2.5);
    dashboardData.impressions = Math.floor(dashboardData.reach * 1.5);
    dashboardData.engagement = (avgEngagementPerPost / dashboardData.followers * 100).toFixed(2);

    // Calcular crescimento comparado ao período anterior
    const prevAvgEngagement = previousPeriodPosts.length > 0 ? (prevTotalLikes + prevTotalComments) / previousPeriodPosts.length : 0;
    const prevReach = previousPeriodPosts.length > 0 ? Math.floor(previousPeriodPosts.length * prevAvgEngagement * 2.5) : 1;

    if (prevReach > 0) {
      dashboardData.reachGrowth = ((dashboardData.reach - prevReach) / prevReach * 100).toFixed(1);
      dashboardData.engagementGrowth = (avgEngagementPerPost > 0 && prevAvgEngagement > 0 ? ((avgEngagementPerPost - prevAvgEngagement) / prevAvgEngagement * 100).toFixed(1) : 0);
      dashboardData.savesGrowth = (prevTotalSaves > 0 ? ((totalSaves - prevTotalSaves) / prevTotalSaves * 100).toFixed(1) : 0);
      dashboardData.conversionGrowth = ((totalLikes + totalComments) / dashboardData.reach > (prevTotalLikes + prevTotalComments) / prevReach ? 5 : -5);
    }

    console.log(`\n📊 COMPARATIVO: Crescimento de ${dashboardData.reachGrowth}% em alcance`);

    dashboardData.conversionRate = ((totalLikes + totalComments) / dashboardData.reach * 100).toFixed(2);
    dashboardData.saveRate = ((totalSaves / dashboardData.impressions) * 100).toFixed(2);
    dashboardData.shareRate = (totalSaves / (totalLikes || 1) * 100).toFixed(2);
    dashboardData.qualifiedEngagement = ((totalSaves + Math.floor(totalLikes * 0.1)) / dashboardData.reach * 100).toFixed(2);

    // Calcular médias por post
    dashboardData.avgLikes = (totalLikes / filteredPosts.length).toFixed(0);
    dashboardData.avgComments = (totalComments / filteredPosts.length).toFixed(0);
    dashboardData.avgSaves = (totalSaves / filteredPosts.length).toFixed(0);
    dashboardData.saveToLikeRatio = (totalSaves / (totalLikes || 1)).toFixed(2);

    console.log(`\n📊 MÉTRICAS DO PERÍODO:`);
    console.log(`  ❤️ Curtidas: ${totalLikes.toLocaleString('pt-BR')}`);
    console.log(`  💬 Comentários: ${totalComments.toLocaleString('pt-BR')}`);
    console.log(`  💾 Salvamentos: ${totalSaves.toLocaleString('pt-BR')}`);
    console.log(`  📢 Alcance estimado: ${dashboardData.reach.toLocaleString('pt-BR')}`);
    console.log(`  👁️ Impressões: ${dashboardData.impressions.toLocaleString('pt-BR')}`);
    console.log(`  ❤️ Engajamento: ${dashboardData.engagement}%`);
    console.log(`  💾 Taxa Salvamento: ${dashboardData.saveRate}%`);
    console.log(`  📊 Média de Curtidas por post: ${dashboardData.avgLikes}`);
    console.log(`  💬 Média de Comentários por post: ${dashboardData.avgComments}`);
    console.log(`  💾 Média de Salvamentos por post: ${dashboardData.avgSaves}\n`);
  } else {
    console.log('⚠️ Nenhum post no período selecionado');
    dashboardData.reach = 0;
    dashboardData.impressions = 0;
    dashboardData.engagement = 0;
  }

  updateDashboard();
  updatePostsList(filteredPosts);
  updateGrowthChart(posts);
  updateReachAndFollowersCharts(filteredPosts);
  updatePerformanceMatrix(filteredPosts);
  updateEngagementMetrics(filteredPosts);
  updateBioClicksAnalysis(filteredPosts);
  updateHourOfDayAnalysis(filteredPosts);
  updateDayOfWeekAnalysis(filteredPosts);
  hideLoading();

  console.timeEnd('⏱️ Tempo total de carregamento');
  const endTime = performance.now();
  console.log(`\n✅ Dashboard carregado em ${((endTime - startTime) / 1000).toFixed(2)}s`);
}

// Atualizar dashboard
function updateDashboard() {
  // Atualizar KPI Cards principais
  const cards = document.querySelectorAll('.kpi-card [data-value]');

  if (cards[0]) cards[0].setAttribute('data-value', dashboardData.reach);
  if (cards[1]) cards[1].setAttribute('data-value', dashboardData.engagement);
  if (cards[2]) cards[2].setAttribute('data-value', dashboardData.followers);
  if (cards[3]) cards[3].setAttribute('data-value', dashboardData.clicks);
  if (cards[4]) cards[4].setAttribute('data-value', dashboardData.saves);
  if (cards[5]) cards[5].setAttribute('data-value', dashboardData.conversionRate);
  if (cards[6]) cards[6].setAttribute('data-value', dashboardData.growthRate);

  // Atualizar valores de crescimento (comparativo)
  const growthElements = document.querySelectorAll('[data-growth]');
  growthElements.forEach(el => {
    const type = el.getAttribute('data-growth');
    const value = dashboardData[type] || 0;
    const symbol = value >= 0 ? '↑' : '↓';
    const color = value >= 0 ? 'text-green-500' : 'text-red-500';
    el.textContent = `${symbol} ${Math.abs(value)}%`;
    el.className = `text-sm font-semibold ${color}`;
  });

  // Atualizar métricas avançadas
  const advancedMetrics = {
    '#impressions': dashboardData.impressions,
    '#saveRate': dashboardData.saveRate,
    '#shareRate': dashboardData.shareRate,
    '#qualifiedEngagement': dashboardData.qualifiedEngagement,
    '#netFollowerGrowth': dashboardData.netFollowerGrowth,
    '#avgLikes': dashboardData.avgLikes,
    '#avgComments': dashboardData.avgComments,
    '#avgSaves': dashboardData.avgSaves,
    '#saveRatio': dashboardData.saveToLikeRatio
  };

  Object.entries(advancedMetrics).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) {
      el.textContent = value.toLocaleString('pt-BR');
    }
  });

  animateKPICards();
}

// Animar cards
function animateKPICards() {
  const cards = document.querySelectorAll('.kpi-card');
  cards.forEach(card => {
    const valueElement = card.querySelector('[data-value]');
    if (valueElement) {
      const value = parseFloat(valueElement.getAttribute('data-value'));
      if (value < 100) {
        valueElement.textContent = value.toFixed(1) + '%';
      } else {
        valueElement.textContent = Math.floor(value).toLocaleString('pt-BR');
      }
    }
  });
}

// Atualizar gráfico de crescimento por semana
function updateGrowthChart(posts) {
  const chartBars = document.querySelectorAll('.chart-bar');
  if (chartBars.length === 0 || !posts || posts.length === 0) return;

  const periodStart = new Date(dateFilter.startDate);
  const periodEnd = new Date(dateFilter.endDate);
  const periodDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
  const weekDays = Math.ceil(periodDays / 5);

  const weeks = [];
  for (let i = 0; i < 5; i++) {
    const weekEnd = new Date(periodEnd);
    weekEnd.setDate(weekEnd.getDate() - (4 - i) * weekDays);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - weekDays + 1);

    weeks.push({ start: weekStart, end: weekEnd });
  }

  let maxEngagement = 0;
  const weekData = [];

  weeks.forEach(week => {
    const weekPosts = posts.filter(post => {
      const postDate = new Date(post.timestamp);
      return postDate >= week.start && postDate < week.end;
    });

    const weekLikes = weekPosts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    const weekComments = weekPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const weekSaves = weekPosts.reduce((sum, p) => sum + (p.saved_count || 0), 0);
    const engagement = weekLikes + weekComments + weekSaves;

    maxEngagement = Math.max(maxEngagement, engagement);
    weekData.push({
      posts: weekPosts.length,
      likes: weekLikes,
      comments: weekComments,
      saves: weekSaves,
      engagement: engagement,
      startDate: week.start,
      endDate: week.end
    });
  });

  chartBars.forEach((bar, idx) => {
    const data = weekData[idx];
    const barDiv = bar.querySelector('div');
    const barLabel = bar.querySelector('p');

    if (barDiv && data) {
      const maxHeight = 250;
      const height = maxEngagement > 0 ? (data.engagement / maxEngagement) * maxHeight : 0;
      barDiv.style.height = height + 'px';
    }

    if (barLabel && data) {
      const startDay = data.startDate.getDate();
      const endDay = data.endDate.getDate();
      const startMonth = (data.startDate.getMonth() + 1).toString().padStart(2, '0');
      const endMonth = (data.endDate.getMonth() + 1).toString().padStart(2, '0');
      const startYear = data.startDate.getFullYear();
      const endYear = data.endDate.getFullYear();

      if (startMonth === endMonth) {
        barLabel.textContent = `${startDay.toString().padStart(2, '0')} - ${endDay.toString().padStart(2, '0')}/${startMonth}`;
      } else {
        barLabel.textContent = `${startDay.toString().padStart(2, '0')}/${startMonth} - ${endDay.toString().padStart(2, '0')}/${endMonth}`;
      }
      barLabel.title = `De ${data.startDate.toLocaleDateString('pt-BR')} até ${data.endDate.toLocaleDateString('pt-BR')}`;
    }

    if (data) {
      bar.setAttribute('title', `Posts: ${data.posts}\nCurtidas: ${data.likes}\nComentários: ${data.comments}\nSalvamentos: ${data.saves}`);
      bar.style.cursor = 'pointer';
    }
  });

  console.log('✅ Gráfico atualizado para o período selecionado');
}

// Atualizar posts
function updatePostsList(posts) {
  const container = document.querySelector('.lg\\:col-span-3 .space-y-3');
  if (!container || posts.length === 0) return;

  // Ordenar posts por engajamento (decrescente)
  const sortedPosts = [...posts].sort((a, b) => {
    const engagementA = (a.like_count || 0) + (a.comments_count || 0) + (a.saved_count || 0);
    const engagementB = (b.like_count || 0) + (b.comments_count || 0) + (b.saved_count || 0);
    return engagementB - engagementA;
  });

  container.innerHTML = '';
  sortedPosts.slice(0, 5).forEach((post, idx) => {
    const date = new Date(post.timestamp).toLocaleDateString('pt-BR');
    const typeEmoji = post.media_type === 'IMAGE' ? '🖼️' : post.media_type === 'VIDEO' ? '🎥' : '🎠';
    const typeLabel = post.media_type === 'IMAGE' ? 'Imagem' : post.media_type === 'VIDEO' ? 'Vídeo' : 'Carrossel';

    container.innerHTML += `
      <div class="flex items-center gap-4 pb-3 ${idx < 4 ? 'border-b border-white/10' : ''}">
        <div class="w-32 h-32 card-rounded bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img src="${post.media_url}" alt="${post.caption}" class="w-full h-full object-cover" loading="lazy" decoding="async" width="128" height="128" onerror="this.parentElement.innerHTML='${post.emoji}'">
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium line-clamp-2">${post.caption?.substring(0, 50) || 'Post'}</p>
          <div class="flex items-center gap-2 mt-1">
            <p class="text-xs text-gray-400">${date}</p>
            <span class="text-xs bg-white/10 px-2 py-1 card-rounded">${typeEmoji} ${typeLabel}</span>
          </div>
        </div>
        <div class="text-right flex-shrink-0 flex gap-4">
          <div>
            <p class="text-sm font-bold">${post.like_count.toLocaleString('pt-BR')}</p>
            <p class="text-xs text-gray-400">❤️</p>
          </div>
          <div>
            <p class="text-sm font-bold">${(post.comments_count || 0).toLocaleString('pt-BR')}</p>
            <p class="text-xs text-gray-400">💬</p>
          </div>
        </div>
      </div>
    `;
  });
}

// Gerar dados de alcance por dia
function generateReachByDay(posts) {
  if (!posts || posts.length === 0) return [];

  const reachByDate = {};

  posts.forEach(post => {
    const postDate = new Date(post.timestamp);
    const dateKey = postDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const engagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    const reach = Math.floor(engagement * 2.5); // Estimativa de reach

    if (!reachByDate[dateKey]) {
      reachByDate[dateKey] = 0;
    }
    reachByDate[dateKey] += reach;
  });

  return Object.entries(reachByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, reach]) => ({ date, reach }));
}

// Gerar dados de novos seguidores por dia
function generateFollowersByDay(posts, totalFollowers) {
  if (!posts || posts.length === 0) return [];

  const totalEngagements = posts.reduce((sum, p) => sum + ((p.like_count || 0) + (p.comments_count || 0) + (p.saved_count || 0)), 0);

  const followersByDate = {};

  posts.forEach(post => {
    const postDate = new Date(post.timestamp);
    const dateKey = postDate.toISOString().split('T')[0];

    const engagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    const engagementRatio = totalEngagements > 0 ? engagement / totalEngagements : 0;
    const estimatedFollowers = Math.floor(totalFollowers * engagementRatio * 0.015); // ~1.5% do total

    if (!followersByDate[dateKey]) {
      followersByDate[dateKey] = 0;
    }
    followersByDate[dateKey] += estimatedFollowers;
  });

  return Object.entries(followersByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, followers]) => ({ date, followers }));
}

// Desenhar gráfico de linha SVG com tooltip
function drawLineChart(svgId, data, valueKey, color, label) {
  const svg = document.getElementById(svgId);
  if (!svg || !data || data.length === 0) return;

  const padding = { top: 20, right: 40, bottom: 30, left: 50 };
  const width = 700 - padding.left - padding.right;
  const height = 200 - padding.top - padding.bottom;

  // Encontrar min/max
  const values = data.map(d => d[valueKey]);
  const maxValue = Math.max(...values);
  const minValue = 0;

  // Limpar SVG
  svg.innerHTML = '';

  // Criar grupo para SVG
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(group);

  // Fundo
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '700');
  bg.setAttribute('height', '200');
  bg.setAttribute('fill', 'rgba(255,255,255,0.02)');
  group.appendChild(bg);

  // Eixos
  const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisX.setAttribute('x1', padding.left);
  axisX.setAttribute('y1', height + padding.top);
  axisX.setAttribute('x2', width + padding.left);
  axisX.setAttribute('y2', height + padding.top);
  axisX.setAttribute('stroke', 'rgba(255,255,255,0.1)');
  axisX.setAttribute('stroke-width', '1');
  group.appendChild(axisX);

  // Grid linhas
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (height / 5) * i;
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', padding.left);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('x2', width + padding.left);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', 'rgba(255,255,255,0.05)');
    gridLine.setAttribute('stroke-width', '1');
    group.appendChild(gridLine);
  }

  // Desenhar linha
  if (data.length > 0) {
    let pathD = '';
    data.forEach((point, idx) => {
      const x = padding.left + (width / (data.length - 1 || 1)) * idx;
      const y = padding.top + height - (point[valueKey] / maxValue) * height;

      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    group.appendChild(path);

    // Área preenchida
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', `${pathD} L ${width + padding.left} ${padding.top + height} L ${padding.left} ${padding.top + height} Z`);
    areaPath.setAttribute('fill', color);
    areaPath.setAttribute('opacity', '0.1');
    group.appendChild(areaPath);

    // Tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'rgba(0,0,0,0.95)';
    tooltip.style.color = color;
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontWeight = 'bold';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '10000';
    tooltip.style.border = `2px solid ${color}`;
    tooltip.style.display = 'none';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.boxShadow = `0 0 10px ${color}40`;
    document.body.appendChild(tooltip);

    // Pontos com tooltip
    data.forEach((point, idx) => {
      const x = padding.left + (width / (data.length - 1 || 1)) * idx;
      const y = padding.top + height - (point[valueKey] / maxValue) * height;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', color);
      circle.setAttribute('stroke', 'rgba(27,27,47,1)');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';

      // Área invisível para hover (maior que o ponto)
      const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hitArea.setAttribute('cx', x);
      hitArea.setAttribute('cy', y);
      hitArea.setAttribute('r', '12');
      hitArea.setAttribute('fill', 'transparent');
      hitArea.style.cursor = 'pointer';

      // Mouseover
      hitArea.addEventListener('mouseover', () => {
        // Converter data para formato curto (DD/MM/YY)
        const [year, month, day] = point.date.split('-');
        const shortDate = `${parseInt(day)}/${parseInt(month)}/${year.slice(-2)}`;

        const svgRect = svg.getBoundingClientRect();

        tooltip.textContent = `${shortDate}: ${point[valueKey].toLocaleString('pt-BR')}`;
        tooltip.style.display = 'block';

        // Calcular o tamanho real do SVG na tela
        const scaledX = x * (svgRect.width / 700);
        const scaledY = y * (svgRect.height / 200);

        // Posição em relação à janela
        const tooltipX = svgRect.left + scaledX;
        const tooltipY = svgRect.top + scaledY;

        // Centralizar horizontalmente e posicionar acima do ponto
        tooltip.style.left = (tooltipX - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (tooltipY - 45) + 'px';

        circle.setAttribute('r', '6');
        circle.setAttribute('stroke-width', '3');
      });

      // Mouseout
      hitArea.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
        circle.setAttribute('r', '4');
        circle.setAttribute('stroke-width', '2');
      });

      group.appendChild(circle);
      group.appendChild(hitArea);
    });

    // Labels no eixo X (primero, meio e último)
    [0, Math.floor(data.length / 2), data.length - 1].forEach(idx => {
      if (idx < data.length) {
        const point = data[idx];
        const x = padding.left + (width / (data.length - 1 || 1)) * idx;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height + padding.top + 20);
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', 'rgba(255,255,255,0.5)');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = point.date;
        group.appendChild(text);
      }
    });
  }

  console.log(`✅ Gráfico '${label}' desenhado com ${data.length} pontos e tooltips`);
}

// Calcular Engagement Rate e Conversion Rate
function calculateEngagementMetrics(posts, followers) {
  if (!posts || posts.length === 0) return { engagementRate: 0, conversionRate: 0 };

  let totalEngagements = 0;
  let totalReach = 0;

  posts.forEach(post => {
    const engagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    totalEngagements += engagement;
    // Estimar reach baseado em engajamento
    totalReach += engagement * 2.5; // Proporção comum
  });

  const avgEngagementRate = followers > 0 ? (totalEngagements / followers / posts.length * 100).toFixed(2) : 0;
  const avgConversionRate = totalReach > 0 ? (totalEngagements / totalReach * 100).toFixed(2) : 0;

  return { avgEngagementRate, avgConversionRate };
}

// Analisar cliques na bio por post
function analyzeBioClicks(posts) {
  if (!posts || posts.length === 0) return [];

  // Estimar cliques na bio baseado em performance do post
  return posts.slice(0, 5).map((post, idx) => {
    const totalEngagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    // Estimativa: ~5-15% do engajamento clica na bio
    const estimatedClicks = Math.floor(totalEngagement * (0.07 + Math.random() * 0.08));
    const clickThroughRate = totalEngagement > 0 ? ((estimatedClicks / totalEngagement) * 100).toFixed(1) : 0;

    return {
      post: post.caption?.substring(0, 40) || 'Post',
      date: new Date(post.timestamp).toLocaleDateString('pt-BR'),
      engagement: totalEngagement,
      estimatedClicks,
      ctr: clickThroughRate
    };
  });
}

// Analisar performance por horário do dia
function analyzeByHourOfDay(posts) {
  if (!posts || posts.length === 0) return [];

  const hourStats = {};

  posts.forEach(post => {
    const postDate = new Date(post.timestamp);
    const hour = postDate.getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

    if (!hourStats[hour]) {
      hourStats[hour] = { label: hourLabel, count: 0, totalEngagement: 0, avgEngagement: 0 };
    }

    const engagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    hourStats[hour].count++;
    hourStats[hour].totalEngagement += engagement;
  });

  return Object.values(hourStats)
    .map(stat => ({
      ...stat,
      avgEngagement: Math.floor(stat.totalEngagement / stat.count)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Analisar performance por dia da semana
function analyzeByDayOfWeek(posts) {
  if (!posts || posts.length === 0) return [];

  const daysNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayStats = {};

  posts.forEach(post => {
    const postDate = new Date(post.timestamp);
    const dayOfWeek = postDate.getDay();
    const dayName = daysNames[dayOfWeek];

    if (!dayStats[dayOfWeek]) {
      dayStats[dayOfWeek] = { label: dayName, count: 0, totalEngagement: 0, avgEngagement: 0 };
    }

    const engagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    dayStats[dayOfWeek].count++;
    dayStats[dayOfWeek].totalEngagement += engagement;
  });

  return Object.values(dayStats)
    .filter(day => day.count > 0)
    .map(day => ({
      ...day,
      avgEngagement: Math.floor(day.totalEngagement / day.count)
    }));
}

// Atualizar matriz de performance
function updatePerformanceMatrix(posts) {
  if (!posts || posts.length === 0) return;

  // Top 3 por curtidas
  const topLikes = [...posts].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 3);
  const topLikesContainer = document.getElementById('topLikesContainer');
  if (topLikesContainer) {
    topLikesContainer.innerHTML = topLikes.map((post, idx) => `
      <div class="bg-white/5 card-rounded p-3">
        <p class="text-xs text-gray-400 mb-1">#${idx + 1}</p>
        <p class="text-sm font-semibold line-clamp-2">${post.caption?.substring(0, 40) || 'Post'}</p>
        <div class="flex gap-4 mt-2">
          <div>
            <p class="text-lg font-bold text-pink-400">${(post.like_count || 0).toLocaleString('pt-BR')}</p>
            <p class="text-xs text-gray-500">❤️ Curtidas</p>
          </div>
          <div>
            <p class="text-lg font-bold text-green-400">${(post.saved_count || 0).toLocaleString('pt-BR')}</p>
            <p class="text-xs text-gray-500">💾 Salv.</p>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">${new Date(post.timestamp).toLocaleDateString('pt-BR')}</p>
      </div>
    `).join('');
  }

  // Top 3 por comentários
  const topComments = [...posts].sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0)).slice(0, 3);
  const topCommentsContainer = document.getElementById('topCommentsContainer');
  if (topCommentsContainer) {
    topCommentsContainer.innerHTML = topComments.map((post, idx) => `
      <div class="bg-white/5 card-rounded p-3">
        <p class="text-xs text-gray-400 mb-1">#${idx + 1}</p>
        <p class="text-sm font-semibold line-clamp-2">${post.caption?.substring(0, 40) || 'Post'}</p>
        <div class="flex gap-4 mt-2">
          <div>
            <p class="text-lg font-bold text-blue-400">${(post.comments_count || 0).toLocaleString('pt-BR')}</p>
            <p class="text-xs text-gray-500">💬 Coment.</p>
          </div>
          <div>
            <p class="text-lg font-bold text-green-400">${(post.saved_count || 0).toLocaleString('pt-BR')}</p>
            <p class="text-xs text-gray-500">💾 Salv.</p>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">${new Date(post.timestamp).toLocaleDateString('pt-BR')}</p>
      </div>
    `).join('');
  }

  // Top 3 por salvamentos
  const topSaves = [...posts].sort((a, b) => (b.saved_count || 0) - (a.saved_count || 0)).slice(0, 3);
  const topSavesContainer = document.getElementById('topSavesContainer');
  if (topSavesContainer) {
    topSavesContainer.innerHTML = topSaves.map((post, idx) => `
      <div class="bg-white/5 card-rounded p-3">
        <p class="text-xs text-gray-400 mb-1">#${idx + 1}</p>
        <p class="text-sm font-semibold line-clamp-2">${post.caption?.substring(0, 40) || 'Post'}</p>
        <p class="text-lg font-bold text-green-400 mt-2">${(post.saved_count || 0).toLocaleString('pt-BR')}</p>
        <p class="text-xs text-gray-500 mt-1">${new Date(post.timestamp).toLocaleDateString('pt-BR')}</p>
      </div>
    `).join('');
  }

}

// Análise de palavras-chave (otimizada)
function updateKeywordsAnalysis(posts) {
  if (!posts || posts.length === 0) return;

  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'é', 'são', 'ser', 'estar',
    'e', 'ou', 'de', 'em', 'por', 'para', 'com', 'sem', 'do', 'da', 'dos', 'das',
    'ao', 'aos', 'à', 'às', 'que', 'qual', 'quais', 'quanto', 'como', 'onde', 'quando',
    'este', 'esse', 'aquele', 'esta', 'essa', 'aquela', 'muito', 'pouco', 'todo', 'cada',
    'outro', 'mesmo', 'próprio', 'seu', 'meu', 'nosso', 'já', 'ainda', 'também', 'só',
    'apenas', 'bem', 'mal', 'aqui', 'aí', 'lá', 'será', 'seria', 'foi', 'fosse', 'forem',
    'sendo', 'tenho', 'tem', 'temos', 'se', 'no', 'na', 'nos', 'nas', 'via', 'entre', 'ante',
    'sob', 'sobre', 'durante', 'perante', 'mediante', 'veja', 'confira', 'saiba', 'tá', 'tô'
  ]);

  // Calcular engajamento médio
  const avgEngagement = posts.reduce((sum, p) => sum + ((p.like_count || 0) + (p.comments_count || 0) + (p.saved_count || 0)), 0) / posts.length;

  const hashtags = {};
  const keywords = {};

  // Processar posts - versão otimizada
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    if (!post.caption) continue;

    const engagement = (post.like_count || 0) + (post.comments_count || 0) + (post.saved_count || 0);
    const isTopPerforming = engagement >= avgEngagement ? 1 : 0;

    // Hashtags
    const hashMatches = post.caption.match(/#\w+/g);
    if (hashMatches) {
      for (const tag of hashMatches) {
        const cleanTag = tag.toLowerCase();
        if (!hashtags[cleanTag]) hashtags[cleanTag] = { c: 0, e: 0, t: 0 };
        hashtags[cleanTag].c++;
        hashtags[cleanTag].e += engagement;
        hashtags[cleanTag].t += isTopPerforming;
      }
    }

    // Keywords - processar apenas primeiras 50 palavras para performance
    const words = post.caption
      .toLowerCase()
      .replace(/[^\w\sáéíóúàâãõç]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 50);

    for (const word of words) {
      if (!keywords[word]) keywords[word] = { c: 0, e: 0, t: 0 };
      keywords[word].c++;
      keywords[word].e += engagement;
      keywords[word].t += isTopPerforming;
    }
  }

  // Score: (frequência * efetividade)
  const score = (d) => d.c * (d.t / d.c);

  // Top hashtags
  const topHashtags = Object.entries(hashtags)
    .sort((a, b) => score(b[1]) - score(a[1]))
    .slice(0, 10);

  const hContainer = document.getElementById('topHashtagsContainer');
  if (hContainer) {
    hContainer.innerHTML = topHashtags.map(([tag, d]) => `
      <div class="bg-white/5 card-rounded p-3">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold">${tag}</p>
            <p class="text-xs text-gray-400 mt-1">Usado ${d.c}x</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-pink-400">${Math.round(d.t / d.c * 100)}%</p>
            <p class="text-xs text-gray-500">efetividade</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Top keywords
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => score(b[1]) - score(a[1]))
    .slice(0, 10);

  const kContainer = document.getElementById('topKeywordsContainer');
  if (kContainer) {
    kContainer.innerHTML = topKeywords.map(([word, d]) => `
      <div class="bg-white/5 card-rounded p-3">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold">${word}</p>
            <p class="text-xs text-gray-400 mt-1">Mencionada ${d.c}x</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-blue-400">${Math.round(d.t / d.c * 100)}%</p>
            <p class="text-xs text-gray-500">efetividade</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Fórmula de caption
  const topTags = topHashtags.slice(0, 3).map(([tag]) => tag);
  const topWords = topKeywords.slice(0, 3).map(([word]) => word);

  const typeStats = {};
  for (const p of posts) {
    const t = p.media_type || 'IMAGE';
    typeStats[t] = (typeStats[t] || 0) + ((p.like_count || 0) + (p.comments_count || 0) + (p.saved_count || 0));
  }
  const bestType = Object.entries(typeStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'CAROUSEL';

  const emojis = { 'IMAGE': '🖼️', 'VIDEO': '🎥', 'CAROUSEL': '🎠' };
  const labels = { 'IMAGE': 'Imagem', 'VIDEO': 'Vídeo', 'CAROUSEL': 'Carrossel' };

  const formula = document.getElementById('captionFormula');
  if (formula) {
    formula.innerHTML = `
      <strong>🎯 Tipo:</strong> ${emojis[bestType]} ${labels[bestType]}<br><br>
      <strong>💭 Palavras:</strong> "${topWords.join('", "')}"<br><br>
      <strong>#️⃣ Hashtags:</strong> ${topTags.join(' ')}<br><br>
      <strong>💡 Dica:</strong> Use nos primeiros 30 caracteres para máxima performance.
    `;
  }

  console.log(`✅ Análise de palavras-chave concluída`);
}

// Atualizar gráficos de Reach e Novos Seguidores
function updateReachAndFollowersCharts(posts) {
  if (!posts || posts.length === 0) return;

  // Gerar dados
  const reachData = generateReachByDay(posts);
  const followersData = generateFollowersByDay(posts, dashboardData.followers);

  // Atualizar período
  if (reachData.length > 0) {
    const firstDate = reachData[0].date;
    const lastDate = reachData[reachData.length - 1].date;
    const periodEl = document.getElementById('reachChartPeriod');
    if (periodEl) {
      periodEl.textContent = `${firstDate} até ${lastDate}`;
    }
  }

  // Desenhar gráficos
  drawLineChart('reachChart', reachData, 'reach', '#10B981', 'Alcance');
  drawLineChart('followersChart', followersData, 'followers', '#8B5CF6', 'Novos Seguidores');

  console.log(`✅ Gráficos de Reach e Followers atualizados`);
}

// Atualizar Engagement Rate e Conversion Rate
function updateEngagementMetrics(posts) {
  const metrics = calculateEngagementMetrics(posts, dashboardData.followers);

  const engagementEl = document.getElementById('avgEngagementRate');
  const conversionEl = document.getElementById('avgConversionRate');

  if (engagementEl) engagementEl.textContent = metrics.avgEngagementRate + '%';
  if (conversionEl) conversionEl.textContent = metrics.avgConversionRate + '%';

  console.log(`✅ Métricas: Engagement Rate ${metrics.avgEngagementRate}% | Conversion Rate ${metrics.avgConversionRate}%`);
}

// Atualizar análise de cliques na bio
function updateBioClicksAnalysis(posts) {
  const bioData = analyzeBioClicks(posts);
  const container = document.getElementById('bioClicksContainer');

  if (!container || bioData.length === 0) return;

  container.innerHTML = bioData.map((item, idx) => `
    <div class="bg-white/5 card-rounded p-3 border-l-4 border-blue-500">
      <div class="flex items-start justify-between mb-2">
        <div>
          <p class="text-sm font-semibold line-clamp-1">${item.post}</p>
          <p class="text-xs text-gray-400 mt-1">${item.date}</p>
        </div>
        <div class="text-right text-xs">
          <p class="font-semibold text-blue-400">${item.estimatedClicks.toLocaleString('pt-BR')}</p>
          <p class="text-gray-500">cliques</p>
        </div>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-400">Engajamento: ${item.engagement.toLocaleString('pt-BR')}</span>
        <span class="text-blue-400 font-semibold">CTR: ${item.ctr}%</span>
      </div>
    </div>
  `).join('');

  console.log(`✅ Análise de cliques na bio concluída`);
}

// Atualizar análise por horário do dia
function updateHourOfDayAnalysis(posts) {
  const hourData = analyzeByHourOfDay(posts);
  const container = document.getElementById('hourOfDayContainer');

  if (!container || hourData.length === 0) return;

  const maxEngagement = Math.max(...hourData.map(h => h.avgEngagement));

  container.innerHTML = hourData.map((hour) => {
    const percentage = maxEngagement > 0 ? (hour.avgEngagement / maxEngagement) * 100 : 0;
    return `
      <div class="bg-white/5 card-rounded p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold">${hour.label}</span>
          <span class="text-xs text-gray-400">${hour.count} post${hour.count > 1 ? 's' : ''}</span>
        </div>
        <div class="w-full bg-white/10 card-rounded h-2 mb-2 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-full" style="width: ${percentage}%"></div>
        </div>
        <p class="text-sm font-bold text-blue-400">${hour.avgEngagement.toLocaleString('pt-BR')} eng.</p>
      </div>
    `;
  }).join('');

  console.log(`✅ Análise por horário concluída`);
}

// Atualizar análise por dia da semana
function updateDayOfWeekAnalysis(posts) {
  const dayData = analyzeByDayOfWeek(posts);
  const container = document.getElementById('dayOfWeekContainer');

  if (!container || dayData.length === 0) return;

  const maxEngagement = Math.max(...dayData.map(d => d.avgEngagement));

  container.innerHTML = dayData.map((day) => {
    const percentage = maxEngagement > 0 ? (day.avgEngagement / maxEngagement) * 100 : 0;
    return `
      <div class="bg-white/5 card-rounded p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold">${day.label}</span>
          <span class="text-xs text-gray-400">${day.count} post${day.count > 1 ? 's' : ''}</span>
        </div>
        <div class="w-full bg-white/10 card-rounded h-2 mb-2 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full" style="width: ${percentage}%"></div>
        </div>
        <p class="text-sm font-bold text-purple-400">${day.avgEngagement.toLocaleString('pt-BR')} eng.</p>
      </div>
    `;
  }).join('');

  console.log(`✅ Análise por dia da semana concluída`);
}

// Configurar filtro de data
function setupDateFilter() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Elementos
  const dateStart = document.getElementById('dateStart');
  const dateEnd = document.getElementById('dateEnd');
  const btnFilter = document.getElementById('btnFilter');
  const btnReset = document.getElementById('btnReset');

  if (!dateStart || !dateEnd) {
    console.error('❌ Elementos HTML não encontrados');
    return;
  }

  // Valores padrão
  dateStart.value = formatDate(thirtyDaysAgo);
  dateEnd.value = formatDate(today);

  dateFilter.startDate = new Date(thirtyDaysAgo);
  dateFilter.endDate = new Date(today.getTime() + 86400000);

  // Filtrar
  if (btnFilter) {
    btnFilter.addEventListener('click', async () => {
      const startVal = dateStart.value;
      const endVal = dateEnd.value;

      if (!startVal || !endVal) {
        alert('⚠️ Selecione ambas as datas');
        return;
      }

      const start = new Date(startVal + 'T00:00:00');
      const end = new Date(endVal + 'T23:59:59');

      if (start > end) {
        alert('⚠️ Data inicial deve ser anterior à final');
        return;
      }

      dateFilter.startDate = start;
      dateFilter.endDate = new Date(end.getTime() + 86400000);

      console.log(`📅 Filtro: ${startVal} até ${endVal}`);
      await loadInstagramData();
    });
  }

  // Reset
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      dateStart.value = formatDate(thirtyDaysAgo);
      dateEnd.value = formatDate(today);
      dateFilter.startDate = new Date(thirtyDaysAgo);
      dateFilter.endDate = new Date(today.getTime() + 86400000);
      console.log('🔄 Filtro resetado');
      await loadInstagramData();
    });
  }
}

// Configurar navegação
function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Dashboard iniciando...');
  setupDateFilter();
  setupNavigation();

  // Carregar dados só se tem token
  if (API_TOKEN) {
    await loadInstagramData();
  }

  console.log('✅ Dashboard pronto!');
});

// Exportar
window.dashboardData = dashboardData;
