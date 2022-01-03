import {firstResponseTime, totalMessagesSent} from '../../../../fixtures/stats'
import {OVERVIEW, FIRST_RESPONSE_TIME} from '../../../../config/stats'
import {RootState} from '../../../types'
import {getStatDataByName} from '../selectors'

describe('stats selectors', () => {
    const state: RootState = {
        entities: {
            stats: {
                'first-response-time/first-response-time': firstResponseTime,
                'overview/total-messages-sent': totalMessagesSent,
            },
        },
    } as any

    describe('getStatDataByName', () => {
        it('should return the proper stat', () => {
            expect(
                getStatDataByName(FIRST_RESPONSE_TIME)(state)
            ).toMatchSnapshot()
        })

        it('should return the formatted stat data when combining several charts', () => {
            expect(getStatDataByName(OVERVIEW)(state)).toMatchSnapshot()
        })
    })
})
