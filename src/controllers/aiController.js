// Controllers/hadithController.js

const { Document } = require("langchain/document");
const { CharacterTextSplitter } = require("langchain/text_splitter");
const { VectorDBQAChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const fs = require("fs");
const uploadDir = "uploads";

//add new Hadith
const addOneAi = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.files) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }

    // Extract the filename from req.body.data.filename
    const data = JSON.parse(req.body.data) || "demo";
    const { fileName } = data;
    console.log(fileName);
    // Rename the uploaded file to the custom filename
    const oldFilePath = `${uploadDir}/demo`;
    const newFilePath = `${uploadDir}/${fileName}`;

    fs.renameSync(oldFilePath, newFilePath); // Rename the file

    res.json({
      message: "File uploaded successfully",
      filename: fileName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

const getOneQuery = async (req, res) => {
  try {
    // Path to the uploaded PDF file
    const data = req?.body?.data;
    const { question, filename } = JSON.parse(data);
    console.log(question);
    console.log(filename);
    const pdfFilePath = `${uploadDir}/${filename}`;

    // Check if the file exists
    if (!fs.existsSync(pdfFilePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Load the PDF from the uploaded file
    const loader = new PDFLoader(pdfFilePath);
    const document = await loader.load();

    // Process the PDF content as needed for all pages
    const splitter = new CharacterTextSplitter({
      chunkSize: 1536,
      chunkOverlap: 200,
    });

    //process the document into chunks
    const docs = [];
    for (const page of document) {
      const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: page.pageContent }),
      ]);
      docs.push(...docOutput);
    }

    // Load the docs into the vector store using the OpenAIEmbeddings format
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );

    //create a chain for the vector store
    const model = new OpenAI();
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    });
    //ask the question and process the response
    const response = await chain.call({ query: question });
    const finalResponse = response?.text;

    //log and send the processed response
    console.log(finalResponse);
    res.json({ finalResponse });
  } catch (error) {
    console.error("Error adding data to local index:", error);
    res.status(500).json({ error: "Failed to create the local index" });
  }
};

module.exports = {
  addOneAi,
  getOneQuery,
};
