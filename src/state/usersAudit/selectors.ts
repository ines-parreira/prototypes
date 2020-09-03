import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'
import _noop from 'lodash/noop'

import {RootState} from '../types'
import {humanizeString} from '../../utils.js'
import {getAgents} from '../agents/selectors'

import {UsersAuditState} from './types'

export const getUsersAuditState = (state: RootState): UsersAuditState =>
    state.usersAudit || fromJS({})

export const getUserAuditEvents = createSelector<
    RootState,
    List<any>,
    UsersAuditState
>(
    getUsersAuditState,
    (usersAudit) => (usersAudit.get('events') || fromJS([])) as List<any>
)

export const getUserAuditPagination = createSelector<
    RootState,
    List<any>,
    UsersAuditState
>(
    getUsersAuditState,
    (usersAudit) => (usersAudit.get('meta') || fromJS([])) as List<any>
)

export const getUserAuditUserIdOptions = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    getAgents,
    (agents) =>
        agents.map((agent: Map<any, any>) => ({
            value: agent.get('id'),
            label: agent.get('name') || '',
        })) as List<any>
)

export const getUserAuditObjectsEvents = createSelector<
    RootState,
    Map<any, any>,
    void
>(
    _noop,
    () =>
        fromJS(window.GORGIAS_CONSTANTS.USER_AUDIT_OBJECTS_EVENTS) as Map<
            any,
            any
        >
)

export const getUserAuditObjectTypeOptions = createSelector<
    RootState,
    List<any>,
    Map<any, any>
>(getUserAuditObjectsEvents, (objectsEvents) =>
    objectsEvents
        .map((_, objectType: string) => ({
            value: objectType,
            label: objectType,
        }))
        .toList()
)

export const getUserAuditEventTypeOptions = createSelector<
    RootState,
    List<any>,
    Map<any, any>
>(getUserAuditObjectsEvents, (objectsEvents) => {
    let eventTypes = fromJS([]) as List<any>
    objectsEvents.forEach((props: Map<any, any>) => {
        ;(props.get('events') as List<any>).forEach((eventType: string) => {
            eventTypes = eventTypes.push({
                value: eventType,
                label: humanizeString(eventType),
            })
        })
    })
    return eventTypes
})
