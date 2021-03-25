import React from 'react'
import {shallow} from 'enzyme/build'
import {fromJS} from 'immutable'

import {UserAuditList} from '../UserAuditList'
import Loader from '../../../common/components/Loader/Loader.tsx'
import Pagination from '../../../common/components/Pagination'
import {
    getUserAuditEventTypeOptions,
    getUserAuditObjectTypeOptions,
    getUserAuditUserIdOptions,
} from '../../../../state/usersAudit/selectors.ts'
import UserAuditRow from '../UserAuditRow'

describe('UserAuditList component', () => {
    let component
    let userAuditData

    beforeEach(() => {
        window.GORGIAS_CONSTANTS = {
            USER_AUDIT_OBJECTS_EVENTS: {
                Ticket: {
                    events: [
                        'ticket-created',
                        'ticket-updated',
                        'ticket-deleted',
                    ],
                },
                Macro: {events: ['macro-created']},
            },
        }
        const agents = fromJS([
            {id: 1, name: 'agent 1', email: 'agent1@gorgias.io'},
            {id: 2, name: 'agent 2', email: 'agent2@gorgias.io'},
            {id: 3, name: 'agent 3', email: 'agent3@gorgias.io'},
        ])
        userAuditData = fromJS([
            {
                id: 1,
                type: 'ticket-created',
                object_type: 'Ticket',
                object_id: 111,
                user_id: 1,
                created_datetime: '2018-01-01T00:00:00.000Z',
            },
            {
                id: 2,
                type: 'macro-created',
                object_type: 'Macro',
                object_id: 11,
                user_id: 1,
                created_datetime: '2018-01-02T00:00:00.000Z',
            },
            {
                id: 3,
                type: 'ticket-updated',
                object_type: 'Ticket',
                object_id: 1,
                user_id: 2,
                created_datetime: '2018-01-03T00:00:00.000Z',
            },
        ])
        const userAuditMeta = fromJS({
            per_page: 30,
            page: 1,
            nb_pages: 1,
        })
        component = shallow(
            <UserAuditList
                events={userAuditData}
                eventsListMeta={userAuditMeta}
                userIdOptions={getUserAuditUserIdOptions({users: agents})}
                objectTypeOptions={getUserAuditObjectTypeOptions()}
                eventTypeOptions={getUserAuditEventTypeOptions()}
                fetchUsersAudit={() => Promise.resolve()}
                timezone="US/Pacific"
            />
        )
        component.setState({
            start_datetime: '2017-12-30T00:00:00.000-08:00',
            end_datetime: '2018-01-05T00:00:00.000-08:00',
        })
    })

    it('mounts correctly', () => {
        expect(component).toMatchSnapshot()
    })

    it('should display loader when fetching tags', () => {
        component.setState({isFetching: true})
        expect(component.matchesElement(<Loader />)).toEqual(true)
    })

    it('should not display pagination when there is one page of tags', () => {
        expect(component.find(Pagination).dive().isEmptyRender()).toEqual(true)
    })

    it('should display pagination when there are more than one page of tags', () => {
        component.setProps({eventsListMeta: fromJS({page: 2, nb_pages: 20})})
        expect(component.find(Pagination).dive().isEmptyRender()).toEqual(false)
    })

    it('should display the same number of rows as there are tags', () => {
        expect(component.find(UserAuditRow)).toHaveLength(userAuditData.size)
    })
})
