import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define the sections of the site
const sections = [
    {
        id: "hero",
        title: "About Md Balal Raza",
        content: "Product-Minded Software Engineer specialized in AI integrations and high-performance backend pipelines. I design resilient, multi-model architectures that solve real-world operational bottlenecks and scale with strict unit economics. Engineering, product, AI."
    },
    {
        id: "case-study-math-tutor",
        title: "AI Math Tutor (Guided Doubt Solving)",
        content: "Designed and built an AI Math Tutor utilizing Gemini 3.1 Pro and Flash, delivering guided doubt scaffolding. The interface offers interactive question selection or math worksheet image upload (OCR). While students work, the AI provides real-time guidance and highlights mistakes visually by drawing red circles around incorrect parts of equations, mimicking a human tutor. Achieved 92% self-solved rate, <1.2s ink sync latency, and ~65% GPU cost reduction."
    },
    {
        id: "case-study-voice-bot",
        title: "Enterprise AI Voice Automation Pipeline",
        content: "Event-driven, bidirectional WebSocket system automating Ed-Tech demo reminders and rescheduling. Built with Node.js, FastAPI, Twilio Programmable Voice, Deepgram Flux/Aura-2, and GPT-4o-mini, achieving 30% headcount reduction, <900ms E2E latency, and ~50% per-call cost savings."
    },
    {
        id: "experience-bhanzu",
        title: "Experience: Senior Software Engineer at Bhanzu",
        content: "Senior Software Engineer at Bhanzu (May 2023 - Present) in Bangalore, India. Developed AI Smart Tutor and AI Voice Automation Pipeline. Rewrote student dashboard using bulletproof-react architecture. Built real-time classroom platform using AWS IVS serving 5,000+ concurrent users with screen sharing, whiteboard, PIP, quizzes, breakout rooms. Winner of Bhanzu Hackathon for AI-based Stories and Highlights. Optimized company website Lighthouse score to ~95 desktop and ~85 mobile."
    },
    {
        id: "experience-amex",
        title: "Experience: Consultant Full Stack Developer at American Express",
        content: "Consultant Full Stack Developer at American Express (Dec 2020 - May 2023). Led architectural migration of monolithic enterprise applications to decoupled state-driven components. Optimized database query performance and asynchronous data pipelines, reducing latency by 68% (from 3.8s to 1.2s). Integrated Okta SAML2 SSO across legacy infrastructure, streamlining user onboarding."
    },
    {
        id: "experience-bdi",
        title: "Experience: Full Stack Developer at BDI Plus",
        content: "Full Stack Developer at BDI Plus (Feb 2020 - Dec 2020) in Bangalore, India. Directed a 5-engineer team building 'OneData' ETL orchestration platform featuring real-time state visualization, job scheduling, and transformation pipelines. Deployed automated policy calculation and quote generation engine for 'OneDigital' insurance platform. Designed Augmented Analytics rendering engine."
    },
    {
        id: "experience-finoramic",
        title: "Experience: Founding Engineer at Finoramic",
        content: "Founding Engineer at Finoramic (Sep 2017 - Jan 2020) in Hyderabad, India. Architected 0-to-1 technology stack for personal finance and B2B lending. Built transaction deduplication algorithm and categorization engine. Built B2B lending portal with real-time credit scoring. Slashed manual operational marketing overhead by 80% through automated growth engine."
    },
    {
        id: "doctrine",
        title: "Doctrine: Systems Over Snippets",
        content: "Operating Principles: Systems Over Snippets. Generative AI is inherently non-deterministic. I focus on rigorous guardrails, evaluation metrics, and error-handling hierarchies. I design systems that assume the AI will be wrong and fail gracefully when it is, building resilient, cost-optimized engines."
    },
    {
        id: "contact",
        title: "Contact & Consultation",
        content: "Discuss architectural bottlenecks or high-overhead workflows. Optimize business operations through deterministic AI pipelines and strict unit economics. Direct mail form for name, email, message."
    }
];

async function generateEmbeddings() {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const results = [];

    for (const section of sections) {
        const output = await extractor(section.content, {
            pooling: 'mean',
            normalize: true
        });

        // Extract raw vector array
        const embedding = output.tolist()[0];

        results.push({
            id: section.id,
            title: section.title,
            content: section.content,
            embedding: embedding
        });
    }

    const outputPath = path.join(__dirname, 'embeddings.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
}

generateEmbeddings().catch(err => {
    console.error("Error generating embeddings:", err);
    process.exit(1);
});
