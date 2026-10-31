import type { FastifyRequest } from 'fastify';
import { IdParam } from '../../types/request.type.js';

export const getFileHandler = async (request: FastifyRequest<{ Params: IdParam }>) => {
  const { id } = request.params;
  // TODO get file from storage
  return { message: 'File', data: id };
};

export const deleteFileHandler = async (request: FastifyRequest<{ Params: IdParam }>) => {
  const { id } = request.params;
  // TODO delete file from storage
  return { message: 'File deleted', data: id };
};

export const uploadFileHandler = async (request: FastifyRequest) => {
  const parts = request.files({ throwFileSizeLimit: true, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  for await (const part of parts) {
    if (!allowedMimeTypes.includes(part.mimetype)) {
      part.file.resume();
      continue;
    }
    // TODO upload files to storage
    if (part.file.truncated) {
      // TODO clear storage
      throw {
        message: `File ${part.filename} exceeded maximum size limit`,
        error: 'File',
        statusCode: 413,
      };
    }
  }
  return { message: 'File uploaded' };
};
