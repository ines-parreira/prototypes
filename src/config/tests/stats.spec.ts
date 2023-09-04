import {List} from 'immutable'
import {TicketChannel} from 'business/types/ticket'
import {
    stats as statsConfig,
    TICKETS_CREATED_PER_CHANNEL_PER_DAY,
} from 'config/stats'

describe('config/stats', () => {
    it('should contain label for each Ticket channel', () => {
        const lines = (
            statsConfig
                .get(TICKETS_CREATED_PER_CHANNEL_PER_DAY)
                .get('lines') as List<any>
        ).toArray()

        expect(lines.length).toEqual(Object.keys(TicketChannel).length)
    })
})
