import { renderHook } from '@repo/testing'

import useApplyWayfindingMs1 from '../useApplyWayfindingMs1'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))

const mockUseHelpdeskV2WayfindingMS1Flag = jest.requireMock(
    '@repo/feature-flags',
).useHelpdeskV2WayfindingMS1Flag as jest.Mock

describe('useApplyWayfindingMs1', () => {
    afterEach(() => {
        document.body.classList.remove('wayfindingMs1')
    })

    it('should add wayfindingMs1 class to document.body when flag is true', () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)

        renderHook(() => useApplyWayfindingMs1())

        expect(document.body.classList.contains('wayfindingMs1')).toBe(true)
    })

    it('should not add wayfindingMs1 class to document.body when flag is false', () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)

        renderHook(() => useApplyWayfindingMs1())

        expect(document.body.classList.contains('wayfindingMs1')).toBe(false)
    })

    it('should remove wayfindingMs1 class from document.body on unmount', () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)

        const { unmount } = renderHook(() => useApplyWayfindingMs1())
        expect(document.body.classList.contains('wayfindingMs1')).toBe(true)

        unmount()

        expect(document.body.classList.contains('wayfindingMs1')).toBe(false)
    })

    it('should remove wayfindingMs1 class when flag changes from true to false', () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)

        const { rerender } = renderHook(() => useApplyWayfindingMs1())
        expect(document.body.classList.contains('wayfindingMs1')).toBe(true)

        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        rerender()

        expect(document.body.classList.contains('wayfindingMs1')).toBe(false)
    })
})
