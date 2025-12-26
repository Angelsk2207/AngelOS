
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, GroundingSource } from "../types";

export class GeminiOSService {
  // We initialize the AI client using the provided environment variable
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private extractSources(response: any): GroundingSource[] {
    return response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'External Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];
  }

  async executeTerminalCommand(command: string, context: string): Promise<AIResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User entered command: "${command}". System Context: ${context}. Act as a futuristic OS terminal. If the user asks for real-world information, use Google Search. Otherwise, simulate OS output.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });
      return {
        text: response.text || "Command executed.",
        sources: this.extractSources(response)
      };
    } catch (error) {
      return { text: "Error: Kernel panic in AI sub-process.", sources: [] };
    }
  }

  async assistantChat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<AIResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: 'You are the Gemini OS Neural Assistant. You are technical, helpful, and futuristic. Always use Google Search to provide accurate, up-to-date answers for real-world queries.',
          tools: [{ googleSearch: {} }],
          temperature: 0.8,
        }
      });
      return {
        text: response.text || "...",
        sources: this.extractSources(response)
      };
    } catch (error) {
      return { text: "Neural link interrupted. Please retry.", sources: [] };
    }
  }

  async searchTheGrid(query: string): Promise<AIResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      return {
        text: response.text || "No data found on the grid.",
        sources: this.extractSources(response)
      };
    } catch (error) {
      return { text: "Search matrix unreachable.", sources: [] };
    }
  }
}

export const geminiService = new GeminiOSService();
