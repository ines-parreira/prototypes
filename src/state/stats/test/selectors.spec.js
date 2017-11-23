import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import * as selectors from '../selectors'
import {TICKETS_CLOSED_PER_AGENT} from '../../../config/stats'

jest.addMatchers(immutableMatchers)


describe('stats selectors', () => {
    let state

    beforeEach(() => {
        state = {
            stats: fromJS({})
        }

        state.stats = state.stats.set(TICKETS_CLOSED_PER_AGENT, fromJS({
            data: {
                lines: [
                    ['foo', 1, 100, 10],
                    ['bar', 2, 50, 7],
                    ['boo', 4, 70, 12],
                    ['far', 6, 120, 15]
                ]
            }
        }))
    })

    describe('getStats selector', () => {
        it('should return the whole `stats` state, or an empty Map', () => {
            expect(selectors.getStats(state)).toEqualImmutable(state.stats)
            expect(selectors.getStats({})).toEqualImmutable(fromJS({}))
        })
    })

    describe('getTicketsClosedPerAgentStats selector', () => {
        it('should return all stats of tickets closed per agent, or an empty List', () => {
            expect(selectors.getTicketsClosedPerAgentStats(state))
                .toEqualImmutable(state.stats.getIn([TICKETS_CLOSED_PER_AGENT, 'data', 'lines']))
            expect(selectors.getTicketsClosedPerAgentStats({})).toEqualImmutable(fromJS([]))
        })
    })

    describe('getAgentClosedTicketsStats selector', () => {
        it('should return stats of tickets closed for this agent, or an empty List', () => {
            const user = fromJS({
                name: 'bar'
            })

            expect(selectors.getAgentClosedTicketsStats(user)(state))
                .toEqualImmutable(state.stats.getIn([TICKETS_CLOSED_PER_AGENT, 'data', 'lines', 1]))
            expect(selectors.getAgentClosedTicketsStats(user)({})).toEqualImmutable(fromJS([]))
        })
    })
})
