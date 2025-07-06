import "dotenv/config";
const { GB_API_KEY } = process.env;

console.log("GB_API_KEY:", GB_API_KEY);

if (!GB_API_KEY) {
    throw new Error("Missing environment variables");
}

const CHUNK_SIZE = 5;

export { GB_API_KEY, CHUNK_SIZE };
