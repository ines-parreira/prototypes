// @flow
const isProduction = process.env.NODE_ENV === 'production'

export const PAGE_ID = isProduction ? '2lqy3hys4460' : '35qcq6ntxgz6'
// We're grouping our components (ex: REST API, Facebook Comments, etc..) into groups below (used for filtering).
export const HELPDESK_GROUP_IDS = isProduction
    ? {
          xdk1c5fgbgyh: 'Helpdesk',
          '0x365t428kwc': 'Integrations',
          '6t2f6lmtxb0c': 'Cloud infrastructure',
      }
    : {
          '20nf38t5262g': 'API',
          m0ys84glpszb: 'Integrations',
      }

export const COMPONENT_STATUSES = Object.freeze({
    OPERATIONAL: 'operational',
    DEGRADED_PERFORMANCE: 'degraded_performance',
    PARTIAL_OUTAGE: 'partial_outage',
    MAJOR_OUTAGE: 'major_outage',
})

export const MAINTENANCE_STATUSES = Object.freeze({
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    VERIFYING: 'verifying',
    COMPLETED: 'completed',
})

// Mapping between statuspage.io statuses (https://status.gorgias.com/api) and our own notification status/labels.
export const COMPONENT_STATUS_LABEL = {
    [COMPONENT_STATUSES.OPERATIONAL]: {
        level: 0,
        status: 'info',
        label: 'operational',
    },
    [COMPONENT_STATUSES.DEGRADED_PERFORMANCE]: {
        level: 1,
        status: 'warning',
        label: 'degraded performance',
    },
    [COMPONENT_STATUSES.PARTIAL_OUTAGE]: {
        level: 2,
        status: 'error',
        label: 'a partial outage',
    },
    [COMPONENT_STATUSES.MAJOR_OUTAGE]: {
        level: 3,
        status: 'error',
        label: 'a major outage',
    },
}

export const COMPONENTS_NOTIFICATION_ID = 'status-page-components'
export const MAINTENANCE_NOTIFICATION_ID = 'status-page-maintenance'

// time before the maintenance event we'll display a notification to the user - used to give users some warning.
export const MAINTENANCE_NOTIFICATION_BEFORE_MINUTES = 60

// polling components (incidents) more often
export const COMPONENTS_POLLING_INTERVAL_SECONDS = 30

// polling scheduled maintenance cycles less often since they are usually scheduled in advance
export const MAINTENANCE_POLLING_INTERVAL_SECONDS = 300
