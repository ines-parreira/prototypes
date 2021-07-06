import {
    helpCenterCreated,
    helpCenterDeleted,
    helpCenterFetched,
    helpCenterUpdated,
    helpCentersFetched,
} from '../actions'
import reducer from '../reducer'
import {getHelpcentersResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getHelpcenterResponse.fixture'

describe('helpCenters reducer', () => {
    describe('createHelpcenter action', () => {
        it('should add a new helpcenter to the state', () => {
            const newState = reducer(
                {},
                helpCenterCreated(getHelpcentersResponseFixture[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('deleteHelpcenter action', () => {
        it('should delete a helpcenter from the state', () => {
            const newState = reducer(
                {
                    '1': getHelpcentersResponseFixture[0],
                    '2': getHelpcentersResponseFixture[1],
                },
                helpCenterDeleted(1)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchHelpcenter action', () => {
        it('should add a new helpcenter to the state', () => {
            const newState = reducer(
                {},
                helpCenterFetched(getHelpcentersResponseFixture[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('updateHelpcenter action', () => {
        it('should replace an existing helpcenter in the state', () => {
            const updatedHelpcenterMock = {
                ...getHelpcentersResponseFixture[0],
                name: 'bar',
            }
            const newState = reducer(
                {
                    '1': getHelpcentersResponseFixture[0],
                    '2': getHelpcentersResponseFixture[1],
                },
                helpCenterUpdated(updatedHelpcenterMock)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchHelpcenters action', () => {
        it('should add the helpcenters to the state', () => {
            const newState = reducer(
                {},
                helpCentersFetched(getHelpcentersResponseFixture)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
