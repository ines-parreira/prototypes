import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { helpCenterKeys, useStartIngestion } from 'models/helpCenter/queries'
import { IngestionType } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'

import { useIngestionLogMutation } from '../useIngestionLogMutation'

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

jest.mock('models/helpCenter/queries', () => ({
    useStartIngestion: jest.fn(),
    helpCenterKeys: {
        ingestionLogs: jest.fn(),
    },
}))

describe('useIngestionLogMutation', () => {
    const mockedUseQueryClient = {
        invalidateQueries: jest.fn(),
    }
    const mockedStartIngestionAsync = jest.fn()
    const mockedQueryKey = 'mock-help-center-ingestion-logs-key'

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should call startIngestionAsync and invalidateQueries on success', async () => {
        ;(useQueryClient as jest.Mock).mockReturnValue(mockedUseQueryClient)
        ;(useStartIngestion as jest.Mock).mockReturnValue({
            mutateAsync: mockedStartIngestionAsync,
        })
        ;(helpCenterKeys.ingestionLogs as jest.Mock).mockReturnValue(
            mockedQueryKey,
        )

        const { result } = renderHook(() =>
            useIngestionLogMutation({ helpCenterId: 1 }),
        )

        ;(
            (useStartIngestion as jest.Mock).mock.calls[0] as [
                { onSuccess: () => void },
            ]
        )[0].onSuccess()

        await result.current.startIngestion({
            url: 'https://example.com',
            type: IngestionType.Domain,
        })
        expect(mockedStartIngestionAsync).toHaveBeenCalledWith([
            undefined,
            { help_center_id: 1 },
            { url: 'https://example.com', type: IngestionType.Domain },
        ])
        expect(mockedUseQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: mockedQueryKey,
        })
    })

    it('calls reportError and rethrows error if ingestion fails', async () => {
        const mockedError = new Error('ingestion failed')
        mockedStartIngestionAsync.mockRejectedValueOnce(mockedError)
        ;(useStartIngestion as jest.Mock).mockReturnValue({
            mutateAsync: mockedStartIngestionAsync,
        })

        const { result } = renderHook(() =>
            useIngestionLogMutation({ helpCenterId: 1 }),
        )

        await expect(
            result.current.startIngestion({
                url: 'https://fail.com',
                type: IngestionType.Domain,
            }),
        ).rejects.toThrow('ingestion failed')

        expect(reportError).toHaveBeenCalledWith(mockedError, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                context: 'Error during ingestion start',
                input: {
                    url: 'https://fail.com',
                    type: IngestionType.Domain,
                },
            },
        })

        expect(mockedUseQueryClient.invalidateQueries).not.toHaveBeenCalled()
    })
})
