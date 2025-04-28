import { act } from '@testing-library/react-hooks'

import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { VoiceCallTableColumnName } from './constants'
import useVoiceCallTableOrdering from './useVoiceCallTableOrdering'

jest.mock('hooks/useOrderBy')
const mockUseOrderBy = assumeMock(useOrderBy)

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

    it.each([
        VoiceCallTableColumnName.Date,
        VoiceCallTableColumnName.State,
        VoiceCallTableColumnName.Duration,
        VoiceCallTableColumnName.WaitTime,
        VoiceCallTableColumnName.TalkTime,
        VoiceCallTableColumnName.OngoingTime,
        VoiceCallTableColumnName.LiveStatus,
    ])('should allow ordering by %s', (column: VoiceCallTableColumnName) => {
        const { result } = render()

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(mockUseOrderBy().toggleOrderBy).toHaveBeenCalledWith(column)
    })
})
