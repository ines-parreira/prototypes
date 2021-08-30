import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'
import _noop from 'lodash/noop'

import {RootState} from '../types'
import {humanizeString} from '../../utils'
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
    Map<any, any>,
    UsersAuditState
>(
    getUsersAuditState,
    (usersAudit) => (usersAudit.get('meta') || fromJS({})) as Map<any, any>
)

export const getUserAuditUserIdOptions = createSelector<
    RootState,
    List<{value: string; label: string}>,
    List<any>
>(
    getAgents,
    (agents) =>
        agents.map((agent: Map<any, any>) => ({
            value: agent.get('id'),
            label: agent.get('name') || '',
        })) as List<{value: string; label: string}>
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
    List<{value: string; label: string}>,
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
    List<{value: string; label: string}>,
    Map<any, any>
>(getUserAuditObjectsEvents, (objectsEvents) => {
    let eventTypes = fromJS([]) as List<{value: string; label: string}>
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
