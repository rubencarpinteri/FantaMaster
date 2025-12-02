import { GoogleGenAI } from "@google/genai";
import { Match, TeamStats, Competition } from '../types';

export const getGeminiResponse = async (
  query: string,
  campeonatoTable: TeamStats[],
  battleRoyaleTable: TeamStats[],
  matches: Match[]
) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare context data
  const playedMatches = matches.filter(m => m.isPlayed);
  const context = `
    You are an expert Fantasy Football League Data Analyst.
    
    Here is the data for the league:

    COMPETITION 1: CAMPIONATO (Standard League)
    ${JSON.stringify(campeonatoTable.map(t => ({ rank: t.rank, team: t.team, p: t.played, pts: t.points, w: t.won, d: t.drawn, l: t.lost, gf: t.gf, ga: t.ga })), null, 2)}

    COMPETITION 2: BATTLE ROYALE (All-vs-All every matchday)
    Rules: Every matchday, each team plays against all other teams. 
    Scoring: 3 points for a win, 1 for a draw, 0 for a loss.
    Comparison: Based on GOALS SCORED (e.g., 2 goals vs 1 goal = Win).
    ${JSON.stringify(battleRoyaleTable.map(t => ({ rank: t.rank, team: t.team, pts: t.points, w: t.won, d: t.drawn, l: t.lost })), null, 2)}

    RECENT MATCH RESULTS:
    ${JSON.stringify(playedMatches.slice(-10).map(m => `Matchday ${m.matchday}: ${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`), null, 2)}

    USER QUESTION: "${query}"

    Instructions:
    1. Answer the user's question based strictly on the data provided.
    2. If asked for stats, be precise.
    3. If asked for "funny" stats, look for anomalies (e.g., team with many goals but few points, or a team that wins Battle Royale but loses Championship).
    4. Be concise and engaging.
    5. Do not hallucinate data not present in the context.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the stadium mainframe (API Error). Please try again later.";
  }
};