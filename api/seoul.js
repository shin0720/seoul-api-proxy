// api/seoul.js - Vercel 서버리스 함수 (서울 + 농림축산식품부 API)

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { 
      type = 'vPetInfo', 
      start = '1', 
      end = '10',
      source = 'seoul'  // 'seoul' 또는 'animal'
    } = req.query;
    
    let apiUrl;

    // 농림축산식품부 API (유기동물)
    if (source === 'animal') {
      const ANIMAL_API_KEY = 'ac2d1b8ee2454fc8d0aa41feb603d0505b2beedde7ce0662d3e3d8a8ee25b3c6';
      apiUrl = `https://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic?serviceKey=${ANIMAL_API_KEY}&pageNo=${start}&numOfRows=${end}&_type=json`;
      
      console.log('📡 Fetching Animal API:', apiUrl);
    } 
    // 서울 API (입양동물)
    else {
      const SEOUL_API_KEY = '55556d526a62696237345a68745558';
      apiUrl = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/${type}/${start}/${end}/`;
      
      console.log('📡 Fetching Seoul API:', apiUrl);
    }

    // API 호출
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API HTTP ${response.status}`);
    }

    const data = await response.json();

    // 서울 API 에러 체크
    if (source === 'seoul' && data.RESULT && data.RESULT.CODE !== 'INFO-000') {
      console.error('❌ Seoul API Error:', data.RESULT);
      return res.status(400).json({
        error: true,
        code: data.RESULT.CODE,
        message: data.RESULT.MESSAGE
      });
    }

    // 농림축산식품부 API 에러 체크
    if (source === 'animal' && data.response?.header?.resultCode !== '00') {
      console.error('❌ Animal API Error:', data.response?.header);
      return res.status(400).json({
        error: true,
        code: data.response?.header?.resultCode,
        message: data.response?.header?.resultMsg
      });
    }

    // 성공 응답
    console.log('✅ API Success');
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Proxy Error:', error.message);
    return res.status(500).json({ 
      error: true,
      message: 'Failed to fetch API',
      details: error.message 
    });
  }
}
