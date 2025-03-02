import { MemorySaver } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

// Create a singleton memory instance
export const sharedMemory = new MemorySaver();

// Initialize the LLM
export const llm = new ChatGroq({
  model: "mixtral-8x7b-32768", 
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  temperature: 1.2,
});

// Set up the model calling function
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state.messages);
  return { messages: response };
};

// Create and compile the workflow
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

export const app = workflow.compile({ checkpointer: sharedMemory });

// Helper to retrieve memory for a specific thread
export const getMemoryForThread = (threadId: string) => {
  return sharedMemory.storage[threadId] || null;
};