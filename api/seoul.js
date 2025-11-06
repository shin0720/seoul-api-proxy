// api/seoul.js - Vercel Serverless Function
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const KEY = "55556d526a62696237345a68745558";
  const start = req.query.start || "1";
  const end = req.query.end || "100";
  const url = `http://openapi.seoul.go.kr:8088/${KEY}/json/vPetInfo/${start}/${end}/`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`서울시 API 에러: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("✅ 서울시 API 응답 성공");
    
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ API 호출 실패:", error);
    res.status(500).json({ 
      error: "서울시 API 호출 실패",
      message: error.message 
    });
  }
}

