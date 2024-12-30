import {
    getListAnalyticsCustomReportsQueryOptions,
    useCreateAnalyticsCustomReport,
} from '@gorgias/api-queries'
import {QueryClient} from '@tanstack/react-query'
import {act} from '@testing-library/react-hooks'

import {
    createDashboardMutationConfig,
    useCreateCustomReport,
} from 'hooks/reporting/custom-reports/useCreateCustomReport'
import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/api-queries')
const getListAnalyticsCustomReportsQueryOptionsMock = assumeMock(
    getListAnalyticsCustomReportsQueryOptions
)
const useCreateAnalyticsCustomReportMock = assumeMock(
    useCreateAnalyticsCustomReport
)

describe('createDashboardMutationConfig(queryClient)', () => {
    beforeEach(() => {
        getListAnalyticsCustomReportsQueryOptionsMock.mockReturnValue({
            queryKey: ['customReports'],
        })
    })

    it('should invalidate the custom reports query cache on success', () => {
        const mockQueryClient = {
            invalidateQueries: jest.fn(),
        } as unknown as QueryClient

        const {onSuccess} = createDashboardMutationConfig(mockQueryClient)

        onSuccess()

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(
            getListAnalyticsCustomReportsQueryOptionsMock().queryKey
        )
    })
})

describe('useCreateCustomReport', () => {
    const mutateAsyncMock = jest.fn()

    beforeEach(() => {
        useCreateAnalyticsCustomReportMock.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)
    })

    it('should call mutateAsync', async () => {
        const name = 'Text Report'

        const {result} = renderHookWithQueryClientProvider(() =>
            useCreateCustomReport()
        )

        await act(async () => {
            await result.current.createCustomReport({name})
        })

        expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
        expect(mutateAsyncMock).toHaveBeenCalledWith({
            data: expect.objectContaining({name}),
        })
    })
})
