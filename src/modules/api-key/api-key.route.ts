import type { FastifyPluginAsync } from 'fastify';
import { secured } from '../auth/auth.guard.js';
import {
  createPersonalApiKeyHandler,
  createUserApiKeyHandler,
  deletePersonalApiKeyHandler,
  deleteUserApiKeyHandler,
} from './api-key.controller.js';
import { createUserApiKeySchema, deleteUserApiKeySchema } from './api-key.schema.js';
import type { IdParam } from '../../types/request.type.js';
import { Role } from '../user/user.type.js';
import { FeatureFlag } from '../feature-flag/feature-flag.plugin.js';

const apiKeyRoute: FastifyPluginAsync = async (server) => {
  server.post<{ Params: IdParam }>(
    '/user/:id/api-key',
    {
      onRequest: server.auth([secured([Role.ADMIN])]),
      schema: createUserApiKeySchema,
      config: { featureFlag: FeatureFlag.API_KEYS },
    },
    createUserApiKeyHandler,
  );
  server.delete<{ Params: IdParam }>(
    '/user/:id/api-key',
    {
      onRequest: server.auth([secured([Role.ADMIN])]),
      schema: deleteUserApiKeySchema,
      config: { featureFlag: FeatureFlag.API_KEYS },
    },
    deleteUserApiKeyHandler,
  );
  server.post(
    '/me/api-key',
    {
      onRequest: server.auth([secured()]),
      schema: { hide: true },
      config: { featureFlag: FeatureFlag.API_KEYS },
    },
    createPersonalApiKeyHandler,
  );
  server.delete<{ Params: IdParam }>(
    '/me/api-key',
    {
      onRequest: server.auth([secured()]),
      schema: { hide: true },
      config: { featureFlag: FeatureFlag.API_KEYS },
    },
    deletePersonalApiKeyHandler,
  );
};

export default apiKeyRoute;
