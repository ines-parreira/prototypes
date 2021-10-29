import {
    helpCenterCreated,
    helpCenterDeleted,
    helpCenterFetched,
    helpCenterUpdated,
    helpCentersFetched,
} from '../actions'
import reducer from '../reducer'
import {getHelpCentersResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

describe('helpCenters reducer', () => {
    describe('createHelpCenter action', () => {
        it('should add a new help center to the state', () => {
            const newState = reducer(
                {},
                helpCenterCreated(getHelpCentersResponseFixture.data[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('deleteHelpCenter action', () => {
        it('should delete a help center from the state', () => {
            const newState = reducer(
                {
                    '1': getHelpCentersResponseFixture.data[0],
                    '2': getHelpCentersResponseFixture.data[1],
                },
                helpCenterDeleted(1)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchHelpCenter action', () => {
        it('should add a new help center to the state', () => {
            const newState = reducer(
                {},
                helpCenterFetched(getHelpCentersResponseFixture.data[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('updateHelpCenter action', () => {
        it('should replace an existing help center in the state', () => {
            const updatedHelpCenterMock = {
                ...getHelpCentersResponseFixture.data[0],
                name: 'bar',
            }
            const newState = reducer(
                {
                    '1': getHelpCentersResponseFixture.data[0],
                    '2': getHelpCentersResponseFixture.data[1],
                },
                helpCenterUpdated(updatedHelpCenterMock)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchHelpCenters action', () => {
        it('should add the help centers to the state', () => {
            const newState = reducer(
                {},
                helpCentersFetched(getHelpCentersResponseFixture.data)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
