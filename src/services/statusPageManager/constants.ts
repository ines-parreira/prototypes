import {NotificationStatus} from '../../state/notifications/types'
import {IntegrationType} from '../../models/integration/types'

import {IncidentImpact} from './types'

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

//$TsFixMe fallback for js files, use IncidentImpact enum
export const INCIDENT_IMPACTS = Object.freeze({
    NONE: 'none',
    MINOR: 'minor',
    MAJOR: 'major',
    CRITICAL: 'critical',
})

//$TsFixMe fallback for js files, use IncidentStatus enum
export const INCIDENT_STATUSES = Object.freeze({
    Investigating: 'investigating',
    Identified: 'identified',
    Monitoring: 'monitoring',
    Resolved: 'resolved',
})

// mapping of statuspage components and integration types
export const INTEGRATION_COMPONENTS_TYPES: {
    [key: string]: IntegrationType
} = isProduction
    ? Object.freeze({
          '2mthy5ngnx15': IntegrationType.Aircall, // Aircall Public API
          '9trdjybr6ns8': IntegrationType.Aircall, // Aircall Apps
          cphz58q8ddp1: IntegrationType.Email,
          '02bj4d0s58d5': IntegrationType.Email, // Mailgun smtp
          '97wn3q88vb90': IntegrationType.Email, // Mailgun inbound email
          dmf38pkrn2hh: IntegrationType.Email, // Mailgun outbound email
          k647tnkgnrzn: IntegrationType.Email, // Mailgun API
          c696fffd032x: IntegrationType.Gmail,
          '0k9stqn0czpt': IntegrationType.Outlook,
          slm5jt5rbn6w: IntegrationType.SmoochInside,
          wt84j6hkbg5v: IntegrationType.SmoochInside, // Smooch Core API
          zlsstk1s8j12: IntegrationType.Facebook,
          x95q6p88z8hd: IntegrationType.Facebook, // Instagram comments
          fzmbzjs3p9qd: IntegrationType.Facebook, // Messenger
          '3n3zfvt8ndb4': IntegrationType.Facebook, // Instagram DM
          '2pr7qbc9c17s': IntegrationType.Shopify,
          '212dg2c2png1': IntegrationType.Shopify, // Shopify API & Mobile,
          bsprtz3l874l: IntegrationType.Sms,
      })
    : Object.freeze({
          ykr08lvqnb66: IntegrationType.Aircall,
          '72gh1dxg7hnv': IntegrationType.Facebook,
          wfkm6njpgc6p: IntegrationType.Gmail,
          '3gk4mkb0w9q4': IntegrationType.Outlook,
          ys5kq8wycd9w: IntegrationType.Facebook, // Instagram comments
      })

// Mapping between statuspage.io statuses (https://status.gorgias.com/api) and our own notification status/labels.
export const INCIDENT_IMPACT_LABEL = Object.freeze({
    [IncidentImpact.None]: {
        level: 0,
        status: NotificationStatus.Info,
        label: 'operational',
    },
    [IncidentImpact.Minor]: {
        level: 1,
        status: NotificationStatus.Warning,
        label: 'degraded performance',
    },
    [IncidentImpact.Major]: {
        level: 2,
        status: NotificationStatus.Error,
        label: 'a partial outage',
    },
    [IncidentImpact.Critical]: {
        level: 3,
        status: NotificationStatus.Error,
        label: 'a major outage',
    },
    [IncidentImpact.Maintenance]: {
        level: 0,
        status: NotificationStatus.Info,
        label: 'a maintenance',
    },
})

export const INCIDENTS_NOTIFICATION_ID = 'status-page-components'
export const MAINTENANCE_NOTIFICATION_ID = 'status-page-maintenance'

// time before the maintenance event we'll display a notification to the user - used to give users some warning.
// 4320 minutes = 3 days
export const MAINTENANCE_NOTIFICATION_BEFORE_MINUTES = 4320

// polling incidents more often
export const INCIDENTS_POLLING_INTERVAL_SECONDS = 30

// polling scheduled maintenance cycles less often since they are usually scheduled in advance
export const MAINTENANCE_POLLING_INTERVAL_SECONDS = 300

export const DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY =
    'gorgias-statuspage-closed-banners'

export const DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY =
    'gorgias-statuspage-closed-maintenances'
