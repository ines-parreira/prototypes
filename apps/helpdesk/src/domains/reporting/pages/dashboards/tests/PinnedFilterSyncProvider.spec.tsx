import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useSavedFilterById } from 'domains/reporting/hooks/filters/useSavedFilterById'
import { useSyncPinnedFilter } from 'domains/reporting/hooks/filters/useSyncPinnedFilter'
import { PinnedFilterSyncProvider } from 'domains/reporting/pages/dashboards/PinnedFilterSyncProvider'

jest.mock('domains/reporting/hooks/filters/useSavedFilterById')
jest.mock('domains/reporting/hooks/filters/useSyncPinnedFilter')

describe('PinnedFilterSyncProvider', () => {
    const useSavedFilterByIdMock = assumeMock(useSavedFilterById)
    const useSyncPinnedFilterMock = assumeMock(useSyncPinnedFilter)

    const mockSavedFilter = {
        id: 123,
        name: 'Test Filter',
        filter_group: [],
    }

    const cleanupFnMock = jest.fn()
    const syncFnMock = jest.fn().mockReturnValue(cleanupFnMock)

    beforeEach(() => {
        jest.clearAllMocks()

        useSyncPinnedFilterMock.mockReturnValue(syncFnMock)

        useSavedFilterByIdMock.mockReturnValue({
            data: mockSavedFilter,
            isLoading: false,
            isError: false,
        } as any)
    })

    it('renders children', () => {
        const { getByText } = render(
            <PinnedFilterSyncProvider savedFilterId={123}>
                <div>Test Children</div>
            </PinnedFilterSyncProvider>,
        )

        expect(getByText('Test Children')).toBeInTheDocument()
    })

    it('calls syncPinnedFilter', () => {
        render(
            <PinnedFilterSyncProvider savedFilterId={123}>
                <div>Test Children</div>
            </PinnedFilterSyncProvider>,
        )

        expect(syncFnMock).toHaveBeenCalledWith(mockSavedFilter)
    })

    it('calls syncPinnedFilter', () => {
        const { unmount } = render(
            <PinnedFilterSyncProvider savedFilterId={123}>
                <div>Test Children</div>
            </PinnedFilterSyncProvider>,
        )

        unmount()

        expect(cleanupFnMock).toHaveBeenCalled()
    })

    it("doesn't sync if no data", () => {
        useSavedFilterByIdMock.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        } as any)

        render(
            <PinnedFilterSyncProvider savedFilterId={123}>
                <div>Test Children</div>
            </PinnedFilterSyncProvider>,
        )

        expect(syncFnMock).not.toHaveBeenCalled()
        expect(cleanupFnMock).not.toHaveBeenCalled()
    })
})
