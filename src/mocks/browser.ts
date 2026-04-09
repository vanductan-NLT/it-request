import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/it-request.handlers';

export const worker = setupWorker(...handlers);
