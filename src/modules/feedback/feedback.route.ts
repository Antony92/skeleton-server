import type { FastifyPluginAsync } from 'fastify';
import { secured } from '../auth/auth.guard.js';
import { submitFeedbackHandler } from './feedback.controller.js';
import { submitFeedbackSchema } from './feedback.schema.js';
import type { CreateFeedbackBody } from './feedback.type.js';
import { FeatureFlag } from '../feature-flag/feature-flag.plugin.js';

const feedbackRoute: FastifyPluginAsync = async (server) => {
  server.post<{ Body: CreateFeedbackBody }>(
    '/feedback',
    {
      onRequest: server.auth([secured()]),
      schema: submitFeedbackSchema,
      config: { featureFlag: FeatureFlag.FEEDBACK },
    },
    submitFeedbackHandler,
  );
};

export default feedbackRoute;
