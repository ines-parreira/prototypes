import {renderHook} from '@testing-library/react-hooks'
import {useFlag} from 'common/flags'
import {assumeMock} from 'utils/testing'
import {useIsOverviewPageEnabled} from '../useIsOverviewPageEnabled'

jest.mock('common/flags')
const useFlagSpy = assumeMock(useFlag)

describe('useIsOverviewPageEnabled', () => {
    it('feature flag is enabled', () => {
        useFlagSpy.mockReturnValue(true)
        const {result} = renderHook(() => useIsOverviewPageEnabled())
        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        useFlagSpy.mockReturnValue(false)
        const {result} = renderHook(() => useIsOverviewPageEnabled())
        expect(result.current).toBe(false)
    })
})
