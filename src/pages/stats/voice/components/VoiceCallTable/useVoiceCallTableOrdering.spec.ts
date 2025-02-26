import { act, renderHook } from '@testing-library/react-hooks'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'

import { VoiceCallTableColumnName } from './constants'
import useVoiceCallTableOrdering from './useVoiceCallTableOrdering'

jest.mock('hooks/useOrderBy')
const mockUseOrderBy = assumeMock(useOrderBy)

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

const render = () => renderHook(() => useVoiceCallTableOrdering())

describe('useVoiceCallTableOrdering', () => {
    const useOrderByMockValue: ReturnType<typeof useOrderBy> = {
        orderBy: VoiceCallTableColumnName.Date,
        toggleOrderBy: jest.fn(),
        orderDirection: OrderDirection.Desc,
        orderParam: null,
    }

    beforeEach(() => {
        mockUseOrderBy.mockReturnValue(useOrderByMockValue)
    })

    it('should initialize with default values', () => {
        const { result } = render()

        expect(mockUseOrderBy).toHaveBeenCalledWith(
            VoiceCallTableColumnName.Date,
            OrderDirection.Desc,
        )

        expect(result.current.orderByColumnName).toBe(
            VoiceCallTableColumnName.Date,
        )
        expect(result.current.orderDirection).toBe(OrderDirection.Desc)
        expect(result.current.orderByDimension).toBeDefined()
    })

    it('should call toggleOrderBy when onOrderChange is called with a sortable column', () => {
        const { result } = render()
        const column = VoiceCallTableColumnName.Date

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(result.current.orderByColumnName).toBe(column)
        expect(mockUseOrderBy().toggleOrderBy).toHaveBeenCalledWith(column)
    })

    it('should not call toggleOrderBy when onOrderChange is called with a non-sortable column', () => {
        const { result } = render()
        const column = VoiceCallTableColumnName.Activity

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(mockUseOrderBy().toggleOrderBy).not.toHaveBeenCalled()
    })

    it('should allow ordering by state if the FF is on', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return true
            }
        })

        const { result } = render()
        const column = VoiceCallTableColumnName.State

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(mockUseOrderBy().toggleOrderBy).toHaveBeenCalledWith(column)
    })
})
