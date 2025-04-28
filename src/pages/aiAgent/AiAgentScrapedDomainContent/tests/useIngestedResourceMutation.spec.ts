import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    helpCenterKeys,
    useUpdateIngestedResource,
} from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'
import { renderHook } from 'utils/testing/renderHook'

import { IngestedResourceStatus } from '../constant'
import { useIngestedResourceMutation } from '../hooks/useIngestedResourceMutation'

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

jest.mock('models/helpCenter/queries', () => ({
    useUpdateIngestedResource: jest.fn(),
    helpCenterKeys: {
        ingestedResources: jest.fn(),
    },
}))

describe('useIngestedResourceMutation', () => {
    const mockedUseQueryClient = {
        invalidateQueries: jest.fn(),
    }
    const mockedUpdateIngestedResourceMutateAsync = jest.fn()
    const mockedQueryKey = 'mock-help-center-ingested-resources-key'
    const mockedHelpCenterId = 1
    const mockedIngestionLogId = 2
    const mockedIngestedResourceId = 3

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should call updateIngestedResourceMutateAsync and invalidateQueries on success', async () => {
        ;(useQueryClient as jest.Mock).mockReturnValue(mockedUseQueryClient)
        ;(useUpdateIngestedResource as jest.Mock).mockReturnValue({
            mutateAsync: mockedUpdateIngestedResourceMutateAsync,
        })
        ;(helpCenterKeys.ingestedResources as jest.Mock).mockReturnValue(
            mockedQueryKey,
        )

        const { result } = renderHook(() =>
            useIngestedResourceMutation({
                helpCenterId: mockedHelpCenterId,
                ingestionLogId: mockedIngestionLogId,
            }),
        )

        ;(
            (useUpdateIngestedResource as jest.Mock).mock.calls[0] as [
                { onSuccess: () => void },
            ]
        )[0].onSuccess()

        await result.current.updateIngestedResource(mockedIngestedResourceId, {
            status: IngestedResourceStatus.Disabled,
        })

        expect(mockedUpdateIngestedResourceMutateAsync).toHaveBeenCalledWith([
            undefined,
            mockedIngestedResourceId,
            { status: IngestedResourceStatus.Disabled },
        ])
        expect(mockedUseQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: mockedQueryKey,
        })
    })

    it('should call reportError on error', async () => {
        const mockedError = new Error('Update ingested resource failed')
        mockedUpdateIngestedResourceMutateAsync.mockRejectedValueOnce(
            mockedError,
        )
        ;(useUpdateIngestedResource as jest.Mock).mockReturnValue({
            mutateAsync: mockedUpdateIngestedResourceMutateAsync,
        })

        const { result } = renderHook(() =>
            useIngestedResourceMutation({
                helpCenterId: mockedHelpCenterId,
                ingestionLogId: mockedIngestionLogId,
            }),
        )

        await expect(
            result.current.updateIngestedResource(mockedIngestedResourceId, {
                status: IngestedResourceStatus.Disabled,
            }),
        ).rejects.toThrow(mockedError)

        expect(reportError).toHaveBeenCalledWith(mockedError, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                context: 'Error during ingested resource update',
                updateFields: { status: IngestedResourceStatus.Disabled },
            },
        })

        expect(mockedUseQueryClient.invalidateQueries).not.toHaveBeenCalled()
    })
})
