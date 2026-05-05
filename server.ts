import index from "./index.html";
import { allProblems } from "./src/registry/index.ts";
import { buildSolutionPathMap, getProblemResponse } from "./src/server/problems-api.ts";
import { runUserCode } from "./src/server/run-handler.ts";
import { getHint } from "./src/server/hint-handler.ts";
import type { HintRequest } from "./src/server/hint-handler.ts";

// Build problem path map once at startup
const solutionPathMap = await buildSolutionPathMap();

const server = Bun.serve({
  routes: {
    "/": index,

    "/api/problems": {
      GET: () => {
        const summaries = allProblems.map(p => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          tags: p.tags,
        }));
        return Response.json(summaries);
      },
    },

    "/api/problems/:id": {
      GET: async (req) => {
        const id = req.params.id;
        const problem = await getProblemResponse(id, solutionPathMap);
        if (!problem) {
          return Response.json({ error: "Problem not found" }, { status: 404 });
        }
        return Response.json(problem);
      },
    },

    "/api/run": {
      POST: async (req) => {
        let body: { problemId: string; userCode: string };
        try {
          body = await req.json() as { problemId: string; userCode: string };
        } catch {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }
        const result = await runUserCode(body.problemId, body.userCode);
        return Response.json(result);
      },
    },

    "/api/hint": {
      POST: async (req) => {
        let body: HintRequest;
        try {
          body = await req.json() as HintRequest;
        } catch {
          return Response.json({ hint: "Coach is unavailable — try again in a moment." });
        }
        const hint = await getHint(body);
        return Response.json({ hint });
      },
    },
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Algorithm Gym running at http://localhost:${server.port}`);
