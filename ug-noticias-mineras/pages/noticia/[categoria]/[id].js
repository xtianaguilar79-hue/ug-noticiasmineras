// pages/noticia/[categoria]/[id].js
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';

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

const processPost = (post, categoryKey) => {
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
};

export default function NoticiaPage({ noticia, relatedNews, currentDate }) {
  if (!noticia) {
    return (
      <Layout currentDate={currentDate}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-yellow-800 font-bold text-xl mb-2">Noticia no encontrada</h3>
          <p className="text-yellow-700 mb-6">La noticia que buscas no está disponible.</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{noticia.title} - UG Noticias Mineras</title>
        <meta name="description" content={noticia.subtitle} />
        <meta property="og:title" content={noticia.title} />
        <meta property="og:description" content={noticia.subtitle} />
        <meta property="og:image" content={noticia.image} />
        <meta property="og:url" content={`https://ug-noticias-mineras.vercel.app/noticia/${noticia.categoryKey}/${noticia.id}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={noticia.title} />
        <meta name="twitter:description" content={noticia.subtitle} />
        <meta name="twitter:image" content={noticia.image} />
      </Head>

      <Layout currentDate={currentDate}>
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">
              {noticia.categoryKey === 'nacionales' ? 'Noticias Nacionales' :
               noticia.categoryKey === 'sanjuan' ? 'Noticias de San Juan' :
               noticia.categoryKey === 'sindicales' ? 'Noticias Sindicales' :
               noticia.categoryKey === 'internacionales' ? 'Noticias Internacionales' : 'Columna de Opinión'}
            </h2>
            <div className="w-24 h-1 bg-red-500 mt-2"></div>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
              {noticia.image && (
                <div className="h-80 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={noticia.image} 
                    alt={noticia.title} 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className={`absolute top-4 left-4 ${noticia.categoryColor} text-white px-3 py-1 rounded-full font-semibold text-sm`}>{noticia.categoryKey.toUpperCase()}</div>
                </div>
              )}
              <div className="p-6">
                <h3 className="font-bold text-2xl text-blue-900 mb-4">{noticia.title}</h3>
                {noticia.subtitle && <p className="text-blue-700 font-medium mb-4">{noticia.subtitle}</p>}
                <div className="content-html text-gray-700 leading-relaxed max-w-none prose" 
                  dangerouslySetInnerHTML={{ __html: noticia.content }}>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-100">
                  <p className="text-blue-800 font-medium">{noticia.source}</p>
                  <p className="text-gray-500 text-sm mt-1">Publicado: {noticia.date}</p>
                </div>
              </div>
            </div>
            {relatedNews.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xl font-bold text-blue-900 mb-4">Noticias Relacionadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedNews.map((related) => (
                    <a 
                      key={related.id}
                      href={`/noticia/${related.categoryKey}/${related.id}`}
                      className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-all duration-300 cursor-pointer bg-white rounded-lg shadow-md"
                    >
                      <div className="mb-2">
                        <span className={`${related.categoryColor} text-white px-2 py-1 rounded text-xs font-semibold`}>{related.categoryKey.toUpperCase()}</span>
                      </div>
                      <h5 className="font-medium text-blue-900 text-sm">{related.title}</h5>
                      <p className="text-gray-600 text-xs mt-1">{related.subtitle}</p>
                      <p className="text-gray-500 text-xs mt-2">{related.date}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { categoria, id } = params;
  const categoryId = categories[categoria];

  if (!categoryId) {
    return { notFound: true };
  }

  try {
    // Fetch noticia principal
    const controller1 = new AbortController();
    setTimeout(() => controller1.abort(), 15000);
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${id}&_embed`,
      { signal: controller1.signal }
    );
    if (!response.ok) return { notFound: true };
    const posts = await response.json();
    if (posts.length === 0) return { notFound: true };
    const noticia = processPost(posts[0], categoria);

    // Fetch relacionadas
    const controller2 = new AbortController();
    setTimeout(() => controller2.abort(), 15000);
    const relatedResponse = await fetch(
      `${WORDPRESS_API_URL}/posts?categories=${categoryId}&per_page=10&orderby=date&order=desc&_embed`,
      { signal: controller2.signal }
    );
    let relatedNews = [];
    if (relatedResponse.ok) {
      const relatedPosts = await relatedResponse.json();
      relatedNews = relatedPosts
        .filter(p => p.slug !== id)
        .map(p => processPost(p, categoria))
        .slice(0, 3);
    }

    return {
      props: {
        noticia,
        relatedNews,
        currentDate: new Date().toISOString()
      }
    };
  } catch (err) {
    return { notFound: true };
  }
}