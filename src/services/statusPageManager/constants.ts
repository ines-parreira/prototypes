import {NotificationStatus} from '../../state/notifications/types'
import {IntegrationType} from '../../models/integration/types'

const isProduction = process.env.NODE_ENV === 'production'

export const PAGE_ID = isProduction ? '2lqy3hys4460' : '35qcq6ntxgz6'

export const CLUSTER_GROUP_ID = isProduction ? '88h5zd5h2mgt' : 'nydnlcqwbz23'

// We're grouping our components (ex: REST API, Facebook Comments, etc..) into groups below (used for filtering).
export const HELPDESK_GROUP_IDS: {[key: string]: string} = isProduction
    ? Object.freeze({
          xdk1c5fgbgyh: 'Helpdesk',
          '0x365t428kwc': 'Integrations',
          '6t2f6lmtxb0c': 'Cloud infrastructure',
      })
    : Object.freeze({
          '20nf38t5262g': 'API',
          m0ys84glpszb: 'Integrations',
      })

//$TsFixMe fallback for js files, use ComponentStatus enum
export const COMPONENT_STATUSES = Object.freeze({
    OPERATIONAL: 'operational',
    DEGRADED_PERFORMANCE: 'degraded_performance',
    PARTIAL_OUTAGE: 'partial_outage',
    MAJOR_OUTAGE: 'major_outage',
})

//$TsFixMe fallback for js files, use MaintenanceStatus enum
export const MAINTENANCE_STATUSES = Object.freeze({
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    VERIFYING: 'verifying',
    COMPLETED: 'completed',
})

// mapping of statuspage components and integration types
export const INTEGRATION_COMPONENTS_TYPES: {
    [key: string]: IntegrationType
} = isProduction
    ? Object.freeze({
          '2mthy5ngnx15': IntegrationType.AircallIntegrationType, // Aircall Public API
          '9trdjybr6ns8': IntegrationType.AircallIntegrationType, // Aircall Apps
          cphz58q8ddp1: IntegrationType.EmailIntegrationType,
          '02bj4d0s58d5': IntegrationType.EmailIntegrationType, // Mailgun smtp
          '97wn3q88vb90': IntegrationType.EmailIntegrationType, // Mailgun inbound email
          dmf38pkrn2hh: IntegrationType.EmailIntegrationType, // Mailgun outbound email
          k647tnkgnrzn: IntegrationType.EmailIntegrationType, // Mailgun API
          c696fffd032x: IntegrationType.GmailIntegrationType,
          '0k9stqn0czpt': IntegrationType.OutlookIntegrationType,
          slm5jt5rbn6w: IntegrationType.SmoochInsideIntegrationType,
          wt84j6hkbg5v: IntegrationType.SmoochInsideIntegrationType, // Smooch Core API
          zlsstk1s8j12: IntegrationType.FacebookIntegrationType,
          x95q6p88z8hd: IntegrationType.FacebookIntegrationType, // Instagram comments
          fzmbzjs3p9qd: IntegrationType.FacebookIntegrationType, // Messenger
          '2pr7qbc9c17s': IntegrationType.ShopifyIntegrationType,
          '212dg2c2png1': IntegrationType.ShopifyIntegrationType, // Shopify API & Mobile
      })
    : Object.freeze({
          ykr08lvqnb66: IntegrationType.AircallIntegrationType,
          '72gh1dxg7hnv': IntegrationType.FacebookIntegrationType,
          wfkm6njpgc6p: IntegrationType.GmailIntegrationType,
          '3gk4mkb0w9q4': IntegrationType.OutlookIntegrationType,
      })

// Mapping between statuspage.io statuses (https://status.gorgias.com/api) and our own notification status/labels.
export const COMPONENT_STATUS_LABEL = Object.freeze({
    [COMPONENT_STATUSES.OPERATIONAL]: {
        level: 0,
        status: NotificationStatus.Info,
        label: 'operational',
    },
    [COMPONENT_STATUSES.DEGRADED_PERFORMANCE]: {
        level: 1,
        status: NotificationStatus.Warning,
        label: 'degraded performance',
    },
    [COMPONENT_STATUSES.PARTIAL_OUTAGE]: {
        level: 2,
        status: NotificationStatus.Error,
        label: 'a partial outage',
    },
    [COMPONENT_STATUSES.MAJOR_OUTAGE]: {
        level: 3,
        status: NotificationStatus.Error,
        label: 'a major outage',
    },
})

export const COMPONENTS_NOTIFICATION_ID = 'status-page-components'
export const MAINTENANCE_NOTIFICATION_ID = 'status-page-maintenance'

// time before the maintenance event we'll display a notification to the user - used to give users some warning.
export const MAINTENANCE_NOTIFICATION_BEFORE_MINUTES = 60

// polling components (incidents) more often
export const COMPONENTS_POLLING_INTERVAL_SECONDS = 30

// polling scheduled maintenance cycles less often since they are usually scheduled in advance
export const MAINTENANCE_POLLING_INTERVAL_SECONDS = 300
