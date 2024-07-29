import {createSelector} from 'reselect'
import {getEntities} from 'state/entities/selectors'

export const getAuditLogs = createSelector(
    getEntities,
    (entities) => entities.auditLogEvents
)

export const getAuditLogEvents = createSelector(
    getAuditLogs,
    (auditLogEvents) => Object.values(auditLogEvents)
)
