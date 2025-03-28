import { ProviderLog } from '@app/models/provider-log';
import { FastifyInstance } from 'fastify';

/**
 * Save provider API request log
 */
export async function saveProviderLog(
    fastify: FastifyInstance,
    vrm: string,
    provider: string,
    startTime: number,
    endTime: number,
    responseCode: number,
    errorMessage?: string
) {
    const providerLogRepository = fastify.orm.getRepository(ProviderLog);

    const logEntry = new ProviderLog();
    logEntry.vrm = vrm;
    logEntry.provider = provider;
    logEntry.requestTime = new Date(startTime);
    logEntry.requestDuration = endTime - startTime;
    logEntry.requestUrl = `/valuations/${vrm}`;
    logEntry.responseCode = responseCode;
    logEntry.errorMessage = errorMessage;

    await providerLogRepository.save(logEntry);
}
