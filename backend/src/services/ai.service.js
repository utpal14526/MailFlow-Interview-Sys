import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const aiSpeechToCampaignService = async (req, res) => {
  try {
    const prompt = req.body.transcript;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are a professional email marketing assistant. 
Your job is to take a campaign idea from the user and produce:
1. A short, catchy campaign name
2. A compelling subject line
3. A persuasive email body

 Output ONLY valid JSON in the following format with no extra text:
{
  "campaignName": "string",
  "subject": "string",
  "body": "string"
}`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const rawText = response.choices[0]?.message?.content?.trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      throw new Error("Invalid Ai Response");
    }

    return parsed;
  } catch (error) {
    throw new Error("Ai generation Failed");
  }
};
