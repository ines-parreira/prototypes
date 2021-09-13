import {fromJS, Map} from 'immutable'

import {TicketChannels} from '../../../../business/ticket'
import {getStatsViewFilters} from '../utils'

describe('stats components utils', () => {
    describe('getStatsViewFilters', () => {
        it.each<[string, Map<any, any>]>([
            [
                'period',
                fromJS({
                    period: {
                        start_datetime: '2021-05-29T00:00:00+02:00',
                        end_datetime: '2021-06-04T23:59:59+04:00',
                    },
                }),
            ],
            ['single channel', fromJS({channels: [TicketChannels.EMAIL]})],
            [
                'multiple channels',
                fromJS({
                    channels: [TicketChannels.EMAIL, TicketChannels.CHAT],
                }),
            ],
            [
                'single integration',
                fromJS({
                    integrations: [1],
                }),
            ],
            [
                'multiple integrations',
                fromJS({
                    integrations: [1, 5],
                }),
            ],
            [
                'single agent',
                fromJS({
                    agents: [1],
                }),
            ],
            [
                'multiple agents',
                fromJS({
                    agents: [1, 2, 3],
                }),
            ],
        ])('should return view filters for %s', (testName, statsFilters) => {
            const viewFilters = getStatsViewFilters(
                'ticket.created_datetime',
                statsFilters
            )
            expect(viewFilters).toMatchSnapshot()
        })
    })
})
