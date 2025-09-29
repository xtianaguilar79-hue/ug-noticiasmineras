// pages/index.js
import Head from 'next/head';
import Layout from '../components/Layout';

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/xtianaguilar79-hbsty.wordpress.com';
const categories = {
  nacionales: 170094,
  sanjuan: 67720,
  sindicales: 3865306,
  opinion: 352,
  internacionales: 17119
};

const cleanText = (text) => {
  if (!text) return text;
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/\s+/g, ' ')
    .trim();
};

const processPosts = (posts, categoryKey) => {
  return posts.map(post => {
    let processedContent = post.content?.rendered || '';
    processedContent = cleanText(processedContent);
    let imageUrl = 'https://res.cloudinary.com/dtj4ovgv7/image/upload/v1758249132/Cuchari_dsjsok.jpg';
    if (post.featured_media && post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
    }
    const postDate = new Date(post.date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = postDate.toLocaleDateString('es-ES', options).replace(' de ', ' de ');
    let excerpt = post.excerpt?.rendered || '';
    excerpt = cleanText(excerpt.replace(/<[^>]*>/g, '').trim());
    if (excerpt.length > 150) excerpt = excerpt.substring(0, 150) + '...';
    let title = cleanText(post.title?.rendered || 'Sin título');
    return {
      id: post.slug || post.id,
      title,
      subtitle: excerpt,
      image: imageUrl,
      categoryKey,
      categoryColor: categoryKey === 'nacionales' ? 'bg-blue-600' : 
                    categoryKey === 'sanjuan' ? 'bg-red-500' : 
                    categoryKey === 'sindicales' ? 'bg-green-600' : 
                    categoryKey === 'internacionales' ? 'bg-yellow-600' : 'bg-purple-600',
      content: processedContent,
      source: 'Fuente: WordPress',
      date: formattedDate,
      originalDate: post.date
    };
  });
};

export default function Home({ newsData, loading, error, currentDate }) {
  return (
    <>
      <Head>
        <title>UG Noticias Mineras</title>
        <meta name="description" content="Noticias del sector minero argentino." />
        <meta property="og:title" content="UG Noticias Mineras" />
        <meta property="og:description" content="Noticias nacionales, internacionales, sindicales y de San Juan." />
        <meta property="og:image" content="https://res.cloudinary.com/dtj4ovgv7/image/upload/v1758727006/UG_NOTICIAS_PNG_e2expz.png" />
        <meta property="og:url" content="https://ug-noticias-mineras.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Layout currentDate={currentDate}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-4">
            {loading ? (
              <div className="text-center py-12">Cargando noticias...</div>
            ) : error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Contenido principal</h2>
                <p className="text-gray-600">Este es un placeholder. Puedes expandirlo con tu lógica completa de noticias destacadas.</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-3 text-center">
                <h3 className="text-lg font-bold text-white">Columna de Opinión</h3>
                <div className="w-16 h-1 bg-red-500 mx-auto mt-1"></div>
              </div>
              <div className="p-3 h-24 bg-white flex items-center justify-center">
                {newsData.opinion.length > 0 ? (
                  <p className="text-blue-900 font-semibold text-center text-sm">
                    {newsData.opinion[0].title}
                  </p>
                ) : (
                  <p className="text-gray-500 text-center text-sm">Sin columnas disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps() {
  try {
    let newsData = {
      nacionales: [], sanjuan: [], sindicales: [], opinion: [], internacionales: []
    };

    for (const [key, categoryId] of Object.entries(categories)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(
          `${WORDPRESS_API_URL}/posts?categories=${categoryId}&per_page=10&orderby=date&order=desc&_embed`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (response.ok) {
          const posts = await response.json();
          newsData[key] = processPosts(posts, key);
        }
      } catch (err) {
        console.warn(`Error fetching ${key}:`, err.message);
      }
    }

    return {
      props: {
        newsData,
        loading: false,
        error: null,
        currentDate: new Date().toISOString() // ✅ string ISO serializable
      }
    };
  } catch (err) {
    return {
      props: {
        newsData: { nacionales: [], sanjuan: [], sindicales: [], opinion: [], internacionales: [] },
        loading: false,
        error: 'Error al cargar noticias',
        currentDate: new Date().toISOString()
      }
    };
  }
}