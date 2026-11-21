import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export const FeatureFlag = {
  API_KEYS: 'api_keys',
  FEEDBACK: 'feedback',
} as const;

export type FeatureFlagName = (typeof FeatureFlag)[keyof typeof FeatureFlag];

export type FeatureFlag = {
  name: FeatureFlagName;
  enabled: boolean;
};

export type FeatureFlagsService = {
  getAllFeatureFlags: () => FeatureFlag[];
  getFeatureFlag: (name: FeatureFlagName) => FeatureFlag | undefined;
};

declare module 'fastify' {
  interface FastifyContextConfig {
    featureFlag?: FeatureFlagName;
  }

  interface FastifyInstance {
    featureFlags: FeatureFlagsService;
  }

  interface FastifyRequest {
    getFeatureFlag: (name: FeatureFlagName) => FeatureFlag | undefined;
  }
}

export const featureFlagPluginImpl: FastifyPluginAsync = async (server) => {
  const flags: FeatureFlag[] = [
    { name: FeatureFlag.API_KEYS, enabled: process.env.FF_API_KEYS === 'true' },
    { name: FeatureFlag.FEEDBACK, enabled: process.env.FF_FEEDBACK === 'true' },
  ];
  const featureFlags: FeatureFlagsService = {
    getAllFeatureFlags: () => flags,
    getFeatureFlag: (name) => flags.find((flag) => flag.name === name),
  };
  server.decorate('featureFlags', featureFlags);
  server.decorateRequest('getFeatureFlag', (name: FeatureFlagName) =>
    featureFlags.getFeatureFlag(name),
  );
  server.addHook('preHandler', async (request) => {
    const requiredFlag = request.routeOptions.config.featureFlag;
    if (!requiredFlag) {
      return;
    }
    const flag = request.getFeatureFlag(requiredFlag);
    if (!flag || !flag.enabled) {
      throw {
        message: `Route ${request.method}:${request.url} not found`,
        error: 'Not Found',
        statusCode: 404,
      };
    }
  });
};

const featureFlagPlugin = fp(featureFlagPluginImpl, {
  name: 'feature-flag-plugin',
});

export default featureFlagPlugin;
