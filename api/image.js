// api/image.js - 이미지 프록시 (CORS 우회)

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // animal.go.kr 이미지만 허용
    if (!url.includes("animal.go.kr")) {
      return res
        .status(403)
        .json({ error: "Only animal.go.kr images allowed" });
    }

    console.log("🖼️ Fetching image:", url);

    // 이미지 가져오기
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    // 이미지 데이터 가져오기
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Content-Type 설정
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 1일 캐싱

    // 이미지 반환
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("❌ Image Proxy Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch image",
      details: error.message,
    });
  }
}
