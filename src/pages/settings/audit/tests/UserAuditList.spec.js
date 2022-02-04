import React from 'react'
import {shallow} from 'enzyme/build'
import {fromJS} from 'immutable'

import {events as eventsFixtures} from '../../../../fixtures/event'
import {getAgents} from '../../../../state/agents/selectors'
import Loader from '../../../common/components/Loader/Loader.tsx'
import Navigation from '../../../common/components/Navigation/'
import {UserAuditListContainer} from '../UserAuditList.tsx'
import UserAuditRow from '../UserAuditRow.tsx'

describe('UserAuditList component', () => {
    let component
    let userAuditData

    beforeEach(() => {
        const agents = fromJS([
            {id: 1, name: 'agent 1', email: 'agent1@gorgias.io'},
            {id: 2, name: 'agent 2', email: 'agent2@gorgias.io'},
            {id: 3, name: 'agent 3', email: 'agent3@gorgias.io'},
        ])
        userAuditData = eventsFixtures

        component = shallow(
            <UserAuditListContainer
                auditLogEvents={userAuditData}
                userIdOptions={getAgents({users: agents})}
            />
        )
        component.setState({
            start_datetime: '2017-12-30T00:00:00.000-08:00',
            end_datetime: '2018-01-05T00:00:00.000-08:00',
        })
    })

    it('mounts correctly', () => {
        component.setState({isFetching: false})
        expect(component).toMatchSnapshot()
    })

    it('should display loader when fetching tags', () => {
        component.setState({isFetching: true})
        expect(component.find(Loader).dive().isEmptyRender()).toEqual(false)
    })

    it('should not display navigation when there is one page of tags', () => {
        component.setState({isFetching: false})
        expect(component.find(Navigation).dive().isEmptyRender()).toEqual(true)
    })

    it('should display navigation when there are more items', () => {
        component.setState({
            meta: {next_cursor: 'next', prev_cursor: 'prev'},
        })
        component.setState({isFetching: false})
        expect(component.find(Navigation).dive().isEmptyRender()).toEqual(false)
    })

    it('should display the same number of rows as there are tags', () => {
        component.setState({isFetching: false})
        expect(component.find(UserAuditRow)).toHaveLength(
            Object.keys(userAuditData).length
        )
    })
})
