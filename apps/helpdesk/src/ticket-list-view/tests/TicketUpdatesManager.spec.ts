import { SearchTicketsOrderBy } from '@gorgias/helpdesk-queries'

import TicketUpdatesManager from '../TicketUpdatesManager'

describe('TicketUpdatesManager', () => {
    it('should be initialized with the correct properties', () => {
        const manager = new TicketUpdatesManager(
            1,
            SearchTicketsOrderBy.CreatedDatetimeDesc,
            false,
        )

        expect(manager).toBeDefined()
    })
})
