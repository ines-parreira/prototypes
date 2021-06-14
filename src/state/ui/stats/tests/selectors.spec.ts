import {OVERVIEW, FIRST_RESPONSE_TIME} from '../../../../config/stats'
import {RootState} from '../../../types'
import {getFetchingStatusByName} from '../selectors'

describe('stats selectors', () => {
    const state: RootState = {
        ui: {
            stats: {
                fetchingMap: {
                    'first-response-time/first-response-time': true,
                    'overview/total-messages-sent': true,
                },
            },
        },
    } as any

    describe('getFetchingStatusByName', () => {
        it('should return the proper status', () => {
            expect(
                getFetchingStatusByName(FIRST_RESPONSE_TIME)(state)
            ).toMatchSnapshot()
        })

        it('should return the formatted status data when combining several charts', () => {
            expect(getFetchingStatusByName(OVERVIEW)(state)).toMatchSnapshot()
        })
    })
})
