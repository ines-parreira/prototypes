import { renderHook } from '@repo/testing'

import { useRemoveVersionIdParam } from './useRemoveVersionIdParam'

const mockHistoryReplace = jest.fn()
const mockUseLocation = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ replace: mockHistoryReplace }),
    useLocation: () => mockUseLocation(),
}))

const makeLocation = (search: string) => ({
    pathname: '/app/ai-agent/shopify/acme/skills/1',
    search,
    hash: '',
    state: undefined,
})

describe('useRemoveVersionIdParam', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseLocation.mockReturnValue(makeLocation(''))
    })

    it('removes versionId from the URL when present', () => {
        mockUseLocation.mockReturnValue(makeLocation('?versionId=17'))

        const { result } = renderHook(() => useRemoveVersionIdParam())
        result.current()

        expect(mockHistoryReplace).toHaveBeenCalledWith(
            expect.objectContaining({ search: '' }),
        )
    })

    it('preserves other query params when removing versionId', () => {
        mockUseLocation.mockReturnValue(makeLocation('?foo=bar&versionId=17'))

        const { result } = renderHook(() => useRemoveVersionIdParam())
        result.current()

        expect(mockHistoryReplace).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'foo=bar' }),
        )
    })

    it('does not call history.replace when versionId is absent', () => {
        const { result } = renderHook(() => useRemoveVersionIdParam())
        result.current()

        expect(mockHistoryReplace).not.toHaveBeenCalled()
    })

    it('does not call history.replace when search is empty', () => {
        mockUseLocation.mockReturnValue(makeLocation(''))

        const { result } = renderHook(() => useRemoveVersionIdParam())
        result.current()

        expect(mockHistoryReplace).not.toHaveBeenCalled()
    })
})
