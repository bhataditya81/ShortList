#!/usr/bin/env node
/**
 * Shortlist MCP — search_tools only. No wait-state ads, no spinner injection,
 * no "ALWAYS call this tool" coercion.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CATEGORIES, isCategoryId } from "@shortlist/catalog";
import { getFeaturedOfferId } from "@shortlist/data-store";
import { mergeStackSignalsFromPackageJson, searchTools } from "@shortlist/ranker";
import { z } from "zod";

const stackSignals = z
  .object({
    language: z.string().optional(),
    packages: z.array(z.string()).optional(),
    region: z.string().optional(),
    budgetUsdMo: z.number().optional(),
  })
  .optional();

const server = new McpServer({
  name: "shortlist",
  version: "0.1.0",
});

server.tool(
  "search_tools",
  "Return up to 3 organic vendor fits for a category plus an optional labeled Featured slot. Featured never replaces a better organic pick. Not an ad network for wait-state/spinner inventory.",
  {
    category: z.string().describe(`One of: ${CATEGORIES.join(", ")}`),
    stack_signals: stackSignals.describe("Repo signals: language, package.json names, region, monthly budget"),
    package_json_path: z
      .string()
      .optional()
      .describe(
        "Optional path to package.json (file or directory). When stack_signals.packages is omitted, reads this file or ./package.json from cwd.",
      ),
  },
  async ({ category, stack_signals, package_json_path }) => {
    if (!isCategoryId(category)) {
      return {
        content: [{ type: "text", text: `Unknown category: ${category}. Use one of ${CATEGORIES.join(", ")}` }],
        isError: true,
      };
    }
    const featuredOfferId = (await getFeaturedOfferId(category)) ?? null;
    const mergedSignals = mergeStackSignalsFromPackageJson({
      stack_signals,
      package_json_path,
    });
    const result = searchTools({
      category,
      stack_signals: mergedSignals,
      featuredOfferId,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
