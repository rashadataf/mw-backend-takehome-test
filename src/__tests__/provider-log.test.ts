import { describe, it, expect, vi } from 'vitest';
import { saveProviderLog } from '@app/utils/provider-logs';
import { ProviderLog } from '@app/models/provider-log';
import { fastify } from '~root/test/fastify';
import { Repository } from 'typeorm';

describe('saveProviderLog', () => {
    it('saves a log without real DB calls', async () => {
        const mockInsertt = vi.fn().mockResolvedValue({ id: 1 });
        vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
            insert: mockInsertt,
        } as unknown as Repository<ProviderLog>);

        await saveProviderLog(
            fastify,
            'MOCKVRM',
            'SuperCar',
            Date.now(),
            Date.now() + 100,
            200
        );

        expect(fastify.orm.getRepository).toHaveBeenCalledWith(ProviderLog);
        expect(mockInsertt).toHaveBeenCalledWith({
            vrm: 'MOCKVRM',
            provider: 'SuperCar',
            requestTime: expect.any(Date),
            requestDuration: 100,
            requestUrl: '/valuations/MOCKVRM',
            responseCode: 200,
            errorMessage: undefined,
        });
    });

    it('handles errors without hitting DB', async () => {
        const mockInsert = vi.fn().mockRejectedValue(new Error('Mock DB Error'));
        vi.spyOn(fastify.orm, 'getRepository').mockReturnValue({
            insert: mockInsert,
        } as unknown as Repository<ProviderLog>);

        await expect(
            saveProviderLog(
                fastify,
                'ERRORVRM',
                'PremiumCar',
                Date.now(),
                Date.now(),
                500,
                'Timeout'
            )
        ).rejects.toThrow('Mock DB Error');
    });
});