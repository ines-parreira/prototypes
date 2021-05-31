import {firstResponseTimeStat} from '../../../../fixtures/stats'
import {statFetched} from '../actions'
import reducer from '../reducer'

describe('stats reducer', () => {
    describe('statFetched action', () => {
        it('should add the stat chart to the state', () => {
            const newState = reducer(
                {},
                statFetched({
                    statName: 'overview',
                    resourceName: 'total-tickets-replied',
                    value: firstResponseTimeStat,
                })
            )

            expect(newState).toMatchSnapshot()
        })
    })
})
