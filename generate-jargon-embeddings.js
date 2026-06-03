import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the technical terms and their founder-friendly translations
const jargonTerms = [
    {
        technical_term: "Gemini 3.1 Pro",
        translation: "Google's advanced, highly capable AI model designed to handle complex reasoning, coding, and large amounts of context."
    },
    {
        technical_term: "Flash",
        translation: "A faster, lightweight, and cost-efficient version of Google's Gemini AI model, optimized for quick, real-time responses."
    },
    {
        technical_term: "React",
        translation: "A popular web development library created by Meta (Facebook) for building highly interactive user interfaces."
    },
    {
        technical_term: "Zustand",
        translation: "A small, lightning-fast state-management library that helps keep different parts of a web application in sync."
    },
    {
        technical_term: "Canvas API",
        translation: "A tool in web browsers that allows developers to draw shapes, diagrams, and animations dynamically using code."
    },
    {
        technical_term: "Spatial Vision OCR",
        translation: "An AI capability that reads text from images or drawings while also tracking where each piece of text is located in the space."
    },
    {
        technical_term: "Event-driven WebSocket",
        translation: "A constantly open, two-way communication channel between a user's browser and a server, allowing data to flow instantly back and forth without refresh delays."
    },
    {
        technical_term: "Node.js",
        translation: "A runtime platform that lets developers use JavaScript to write backend server code, rather than just client-side browser logic."
    },
    {
        technical_term: "FastAPI",
        translation: "A modern, extremely fast Python framework used to build APIs (the interfaces that let different software programs talk to each other)."
    },
    {
        technical_term: "Twilio Programmable Voice",
        translation: "A cloud communications service that allows software applications to programmatically place and receive automated phone calls."
    },
    {
        technical_term: "Deepgram Flux/Aura-2",
        translation: "State-of-the-art, low-latency AI speech-to-text and text-to-speech models designed to enable realistic voice conversations."
    },
    {
        technical_term: "GPT-4o-mini",
        translation: "OpenAI's efficient, compact language model designed for fast reasoning at a fraction of the usual cost."
    },
    {
        technical_term: "bulletproof-react",
        translation: "A highly regarded industry template and architectural design pattern for organizing React code to make it maintainable and robust."
    },
    {
        technical_term: "AWS IVS",
        translation: "Amazon Interactive Video Service, a managed service built on the tech stack behind Twitch that allows developers to add live streaming to their own apps."
    },
    {
        technical_term: "monolithic",
        translation: "An old-school software architecture where the entire system is built as a single, massive codebase, making it hard to update parts independently."
    },
    {
        technical_term: "SSO",
        translation: "Single Sign-On, a mechanism that lets a user log in once and gain access to multiple separate applications without re-entering credentials."
    },
    {
        technical_term: "SAML2",
        translation: "An XML-based industry standard for securely sharing authentication and authorization details between different login services."
    },
    {
        technical_term: "ETL",
        translation: "Extract, Transform, Load - a data processing pipeline that retrieves raw data from various databases, cleans and formats it, and stores it in a central database."
    },
    {
        technical_term: "orchestration",
        translation: "The automated coordination and management of multiple complex software processes and services to work together smoothly."
    },
    {
        technical_term: "Augmented Analytics",
        translation: "An approach that uses AI and machine learning to automatically prepare, clean, and visualize data insights for users."
    },
    {
        technical_term: "transaction deduplication",
        translation: "An algorithm that identifies and deletes duplicate entries of the same financial transaction, ensuring data accuracy."
    },
    {
        technical_term: "zero-shot-classification",
        translation: "An AI method where a model categorizes text into groups it was never explicitly trained on, using its general language understanding."
    },
    {
        technical_term: "edge AI",
        translation: "Running artificial intelligence models directly on the user's local device (like a phone or browser) instead of sending data to a remote cloud server."
    },
    {
        technical_term: "Cosine Similarity",
        translation: "A mathematical metric used to calculate how closely related two texts are by measuring the angle between their vector representations."
    },
    {
        technical_term: "client-side RAG",
        translation: "Retrieval-Augmented Generation running locally in the browser, combining text search with local AI embeddings to pull up matching resume data without sending data to servers."
    },
    {
        technical_term: "Transformers.js",
        translation: "A library that enables standard machine learning models to run directly inside web browsers using JavaScript."
    },
    {
        technical_term: "MiniLM",
        translation: "A highly compact, fast language model optimized for generating mathematical vector representations of sentences."
    },
    {
        technical_term: "tokenizer",
        translation: "A tool that breaks down normal sentences into individual words or sub-words (tokens) that an AI model can understand."
    },
    {
        technical_term: "LaTeX",
        translation: "A high-quality typesetting system used for producing scientific documents, academic papers, and complex math formulas."
    }
];

async function generateJargonEmbeddings() {
    console.log("Initializing Xenova feature-extraction pipeline...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log(`Generating embeddings for ${jargonTerms.length} terms...`);
    const results = [];

    for (const item of jargonTerms) {
        // Embed the technical term text so we can perform similarity search on it
        const output = await extractor(item.technical_term, {
            pooling: 'mean',
            normalize: true
        });

        // Extract raw vector array
        const embedding = output.tolist()[0];

        results.push({
            technical_term: item.technical_term,
            translation: item.translation,
            embedding: embedding
        });
        console.log(`Processed: "${item.technical_term}"`);
    }

    const outputPath = path.join(__dirname, 'jargon-dictionary.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Saved jargon dictionary to ${outputPath}`);
}

generateJargonEmbeddings().catch(err => {
    console.error("Error generating jargon embeddings:", err);
    process.exit(1);
});
