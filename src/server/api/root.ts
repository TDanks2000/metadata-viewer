import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adsenseRouter } from "./routers/adsense";
import { metadataRouter } from "./routers/metadata";
import { sitemapRouter } from "./routers/sitemap";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	metadata: metadataRouter,
	sitemap: sitemapRouter,
	adsense: adsenseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
