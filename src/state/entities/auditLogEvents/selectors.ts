import {createSelector} from 'reselect'
import {RootState} from 'state/types'

const getEntities = (state: RootState) => state.entities

export const getAuditLogs = createSelector(
    getEntities,
    (entities) => entities.auditLogEvents
)

export const getAuditLogEvents = createSelector(
    getAuditLogs,
    (auditLogEvents) => Object.values(auditLogEvents)
)
