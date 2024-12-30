import {
    getGetAnalyticsCustomReportQueryOptions,
    getListAnalyticsCustomReportsQueryOptions,
    useUpdateAnalyticsCustomReport,
} from '@gorgias/api-queries'
import {QueryClient} from '@tanstack/react-query'
import {act} from '@testing-library/react-hooks'
import {noop} from 'lodash'

import {
    updateDashboardMutationConfig,
    useUpdateCustomReportName,
} from 'hooks/reporting/custom-reports/useUpdateCustomReportName'
import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/api-queries')
const getGetAnalyticsCustomReportQueryOptionsMock = assumeMock(
    getGetAnalyticsCustomReportQueryOptions
)
const getListAnalyticsCustomReportsQueryOptionsMock = assumeMock(
    getListAnalyticsCustomReportsQueryOptions
)
const useUpdateAnalyticsCustomReportMock = assumeMock(
    useUpdateAnalyticsCustomReport
)

describe('createDashboardMutationConfig(queryClient)', () => {
    beforeEach(() => {
        getGetAnalyticsCustomReportQueryOptionsMock.mockImplementation(
            (id: number) => ({queryKey: ['customReports', id]})
        )

        getListAnalyticsCustomReportsQueryOptionsMock.mockImplementation(
            () => ({queryKey: ['customReports']})
        )
    })

    it('should invalidate the custom reports query cache on success', () => {
        const mockQueryClient = {
            invalidateQueries: jest.fn(),
        } as unknown as QueryClient

        const id = 123

        const {onSuccess} = updateDashboardMutationConfig(mockQueryClient)

        onSuccess({data: {id}} as any).catch(noop)

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(
            getGetAnalyticsCustomReportQueryOptionsMock(id).queryKey
        )

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(
            getListAnalyticsCustomReportsQueryOptionsMock().queryKey
        )
    })
})

describe('useUpdateCustomReportName(id)', () => {
    const mutateAsyncMock = jest.fn()

    beforeEach(() => {
        useUpdateAnalyticsCustomReportMock.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)
    })

    it('should call mutateAsync', async () => {
        const id = 123
        const name = 'Text Report'

        const {result} = renderHookWithQueryClientProvider(() =>
            useUpdateCustomReportName(id)
        )

        await act(async () => {
            await result.current.updateCustomReport({name})
        })

        expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
        expect(mutateAsyncMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id,
                data: expect.objectContaining({name}),
            })
        )
    })
})
