import React from 'react'
import InfobarUserActions from '../InfobarUserActions'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

const commonProps = {
    user: fromJS({
        id: 1
    }),
    sources: fromJS({
        user: {
            id: 1
        },
        ticket: {
            id: 2
        }
    }),
    selectedUser: fromJS({
        id: 3
    }),
    toggleMergeUserModal: () => {},
    setRequester: () => {}
}

jest.mock('../../../../../../utils', () => ({
    isCurrentlyOnTicket: (ticketId) => !!ticketId
}))

describe('InfobarUserActions component', () => {
    it('should not render "set as requester" button because the agent is not on a ticket', () => {
        const component = shallow(
            <InfobarUserActions
                {...commonProps}
                sources={fromJS({
                    user: {
                        id: 1
                    }
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render "set as requester" nor "merge" buttons because the users are the same', () => {
        const component = shallow(
            <InfobarUserActions
                {...commonProps}
                selectedUser={commonProps.user}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render "merge" button because there is no user to merge the selected user with', () => {
        const component = shallow(
            <InfobarUserActions
                {...commonProps}
                user={fromJS({})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render "set as requester" and "merge" button', () => {
        const component = shallow(
            <InfobarUserActions
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
