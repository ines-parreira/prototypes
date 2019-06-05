// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {stateType} from '../types'
import {humanizeString} from '../../utils'
import {getAgents} from '../agents/selectors'

export const getUsersAuditState = (state: stateType) => state.usersAudit || fromJS({})

export const getUserAuditEvents = createSelector(
    [getUsersAuditState],
    (usersAudit) => usersAudit.get('events') || fromJS([])
)

export const getUserAuditPagination = createSelector(
    [getUsersAuditState],
    (usersAudit) => usersAudit.get('meta') || fromJS([])
)

export const getUserAuditUserIdOptions = createSelector(
    [getAgents],
    (agents) => agents.map((agent) => ({
        value: agent.get('id'),
        label: agent.get('name') || '',
    }))
)

//$FlowFixMe
export const getUserAuditObjectsEvents = createSelector([], () => fromJS(
    window.GORGIAS_CONSTANTS.USER_AUDIT_OBJECTS_EVENTS))

export const getUserAuditObjectTypeOptions = createSelector(
    [getUserAuditObjectsEvents],
    (objectsEvents) => objectsEvents.map((_, objectType) => ({
        value: objectType,
        label: objectType,
    })).toList()
)

export const getUserAuditEventTypeOptions = createSelector(
    [getUserAuditObjectsEvents],
    (objectsEvents) => {
        let eventTypes = fromJS([])
        objectsEvents.forEach((props) => {
            props.get('events').forEach((eventType) => {
                eventTypes = eventTypes.push({
                    value: eventType,
                    label: humanizeString(eventType),
                })
            })
        })
        return eventTypes
    }
)
