import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import useVoiceCallTableOrdering from 'domains/reporting/pages/voice/components/VoiceCallTable/useVoiceCallTableOrdering'
import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'

jest.mock('hooks/useOrderBy')
const mockUseOrderBy = assumeMock(useOrderBy)

const render = () => renderHook(() => useVoiceCallTableOrdering())

describe('useVoiceCallTableOrdering', () => {
    const useOrderByMockValue: ReturnType<typeof useOrderBy> = {
        orderBy: VoiceCallTableColumn.Date,
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
            VoiceCallTableColumn.Date,
            OrderDirection.Desc,
        )

        expect(result.current.orderByColumnName).toBe(VoiceCallTableColumn.Date)
        expect(result.current.orderDirection).toBe(OrderDirection.Desc)
        expect(result.current.orderByDimension).toBeDefined()
    })

    it('should call toggleOrderBy when onOrderChange is called with a sortable column', () => {
        const { result } = render()
        const column = VoiceCallTableColumn.Date

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(result.current.orderByColumnName).toBe(column)
        expect(mockUseOrderBy().toggleOrderBy).toHaveBeenCalledWith(column)
    })

    it('should not call toggleOrderBy when onOrderChange is called with a non-sortable column', () => {
        const { result } = render()
        const column = VoiceCallTableColumn.Activity

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(mockUseOrderBy().toggleOrderBy).not.toHaveBeenCalled()
    })

    it.each([
        VoiceCallTableColumn.Date,
        VoiceCallTableColumn.State,
        VoiceCallTableColumn.Duration,
        VoiceCallTableColumn.WaitTime,
        VoiceCallTableColumn.TalkTime,
        VoiceCallTableColumn.OngoingTime,
        VoiceCallTableColumn.LiveStatus,
    ])('should allow ordering by %s', (column: VoiceCallTableColumn) => {
        const { result } = render()

        act(() => {
            result.current.onOrderChange(column)
        })

        expect(mockUseOrderBy().toggleOrderBy).toHaveBeenCalledWith(column)
    })
})
