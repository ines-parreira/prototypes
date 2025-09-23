import * as index from '..'
import { NavigationProvider } from '../components/NavigationProvider'
import { TicketInfobarTab } from '../constants'
import { useTicketInfobarNavigation } from '../hooks/useTicketInfobarNavigation'

describe('index', () => {
    it('should export the correct things', async () => {
        expect(index).toEqual(
            expect.objectContaining({
                NavigationProvider,
                TicketInfobarTab,
                useTicketInfobarNavigation,
            }),
        )
    })
})
