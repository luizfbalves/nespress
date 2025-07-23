import type { Response } from 'express'

export interface ErrorHandlerOptions {
  debug?: boolean
}

/**
 * Handles errors and sends a JSON response.
 *
 * @param error - The error thrown by the route handler or middleware.
 * @param res - Express response object used to send the error payload.
 * @param options - Optional settings such as debug mode.
 */
export function handleError(error: any, res: Response, options: ErrorHandlerOptions = {}): void {
  const statusCode = error?.statusCode ?? 500
  const debug = options.debug ?? process.env.NODE_ENV !== 'production'

  const payload: Record<string, any> = {
    message: error?.message ?? 'Erro interno do servidor',
  }

  if (error?.code !== undefined) payload.code = error.code
  if (debug && error?.stack) payload.stack = error.stack

  res.status(statusCode).json(payload)
}
