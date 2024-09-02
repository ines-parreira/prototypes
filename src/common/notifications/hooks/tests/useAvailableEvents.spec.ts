import {renderHook} from '@testing-library/react-hooks'

import {useFlag} from 'common/flags'
import {enabledEvents} from 'common/notifications/data'

import useAvailableEvents from '../useAvailableEvents'

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

describe('useAvailableEvents', () => {
    it('should return all events when ticket-message.created is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        const {result} = renderHook(() => useAvailableEvents())
        expect(result.current).toEqual(enabledEvents)
    })

    it('should return all events except ticket-message.created when ticket-message.created is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        const {result} = renderHook(() => useAvailableEvents())
        expect(result.current).toEqual(
            enabledEvents.filter(
                (event) => event.type !== 'ticket-message.created'
            )
        )
    })
})
