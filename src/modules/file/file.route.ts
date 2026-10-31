import type { FastifyPluginAsync } from 'fastify';
import { uploadFileHandler, getFileHandler, deleteFileHandler } from './file.controller.js';
import { IdParam } from '../../types/request.type.js';
import { secured } from '../auth/auth.guard.js';
import { Role } from '../user/user.type.js';

const fileRoute: FastifyPluginAsync = async (server) => {
  server.post(
    '/file/upload',
    { onRequest: server.auth([secured([Role.ADMIN])]), schema: { hide: true } },
    uploadFileHandler,
  );
  server.get<{ Params: IdParam }>(
    '/file/:id',
    { onRequest: server.auth([secured([Role.ADMIN])]), schema: { hide: true } },
    getFileHandler,
  );
  server.delete<{ Params: IdParam }>(
    '/file/:id',
    { onRequest: server.auth([secured([Role.ADMIN])]), schema: { hide: true } },
    deleteFileHandler,
  );
};

export default fileRoute;
