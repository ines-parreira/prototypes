import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    helpCenterKeys,
    useUpdateAllIngestedResourcesStatus,
    useUpdateIngestedResource,
} from 'models/helpCenter/queries'

import { IngestedResourceStatus } from '../constant'
import { useIngestedResourceMutation } from '../hooks/useIngestedResourceMutation'

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

jest.mock('models/helpCenter/queries', () => ({
    useUpdateIngestedResource: jest.fn(),
    useUpdateAllIngestedResourcesStatus: jest.fn(),
    helpCenterKeys: {
        ingestedResources: jest.fn(),
    },
}))

describe('useIngestedResourceMutation', () => {
    const mockedUseQueryClient = {
        invalidateQueries: jest.fn(),
    }
    const mockedUpdateIngestedResourceMutateAsync = jest.fn()
    const mockedUpdateAllIngestedResourcesStatusMutateAsync = jest.fn()
    const mockedQueryKey = 'mock-help-center-ingested-resources-key'
    const mockedHelpCenterId = 1
    const mockedIngestionLogId = 2
    const mockedIngestedResourceId = 3

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should call the functions and invalidateQueries on success', async () => {
        ;(useQueryClient as jest.Mock).mockReturnValue(mockedUseQueryClient)
        ;(useUpdateIngestedResource as jest.Mock).mockReturnValue({
            mutateAsync: mockedUpdateIngestedResourceMutateAsync,
        })
        ;(useUpdateAllIngestedResourcesStatus as jest.Mock).mockReturnValue({
            mutateAsync: mockedUpdateAllIngestedResourcesStatusMutateAsync,
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
            {
                help_center_id: mockedHelpCenterId,
                ingested_resource_id: mockedIngestedResourceId,
            },
            { status: IngestedResourceStatus.Disabled },
        ])
        expect(mockedUseQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: mockedQueryKey,
        })
        ;(
            (useUpdateAllIngestedResourcesStatus as jest.Mock).mock
                .calls[0] as [{ onSuccess: () => void }]
        )[0].onSuccess()

        await result.current.updateAllIngestedResourcesStatus({
            status: IngestedResourceStatus.Disabled,
        })

        expect(
            mockedUpdateAllIngestedResourcesStatusMutateAsync,
        ).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: mockedHelpCenterId,
                article_ingestion_log_id: mockedIngestionLogId,
            },
            { status: IngestedResourceStatus.Disabled },
        ])
        expect(mockedUseQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: mockedQueryKey,
        })
    })

    it('should call reportError on error', async () => {
        const mockedSingleUpdateError = new Error(
            'Update ingested resource failed',
        )
        const mockedAllUpdateError = new Error(
            'Update all ingested resources status failed',
        )
        mockedUpdateIngestedResourceMutateAsync.mockRejectedValueOnce(
            mockedSingleUpdateError,
        )
        mockedUpdateAllIngestedResourcesStatusMutateAsync.mockRejectedValueOnce(
            mockedAllUpdateError,
        )
        ;(useUpdateIngestedResource as jest.Mock).mockReturnValue({
            mutateAsync: mockedUpdateIngestedResourceMutateAsync,
        })
        ;(useUpdateAllIngestedResourcesStatus as jest.Mock).mockReturnValue({
            mutateAsync: mockedUpdateAllIngestedResourcesStatusMutateAsync,
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
        ).rejects.toThrow(mockedSingleUpdateError)

        expect(reportError).toHaveBeenCalledWith(mockedSingleUpdateError, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                context: 'Error during ingested resource update',
                updateFields: { status: IngestedResourceStatus.Disabled },
            },
        })

        expect(mockedUseQueryClient.invalidateQueries).not.toHaveBeenCalled()

        await expect(
            result.current.updateAllIngestedResourcesStatus({
                status: IngestedResourceStatus.Disabled,
            }),
        ).rejects.toThrow(mockedAllUpdateError)

        expect(reportError).toHaveBeenCalledWith(mockedAllUpdateError, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                context: 'Error during ingested resources status update',
                updateFields: { status: IngestedResourceStatus.Disabled },
            },
        })

        expect(mockedUseQueryClient.invalidateQueries).not.toHaveBeenCalled()
    })
})
