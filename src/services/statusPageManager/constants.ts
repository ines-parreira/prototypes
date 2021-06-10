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
          ys5kq8wycd9w: IntegrationType.FacebookIntegrationType, // Instagram comments
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
})

export const INCIDENTS_NOTIFICATION_ID = 'status-page-components'
export const MAINTENANCE_NOTIFICATION_ID = 'status-page-maintenance'

// time before the maintenance event we'll display a notification to the user - used to give users some warning.
// 7200 minutes = 5 days
export const MAINTENANCE_NOTIFICATION_BEFORE_MINUTES = 7200

// polling incidents more often
export const INCIDENTS_POLLING_INTERVAL_SECONDS = 30

// polling scheduled maintenance cycles less often since they are usually scheduled in advance
export const MAINTENANCE_POLLING_INTERVAL_SECONDS = 300

export const DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY =
    'gorgias-statuspage-closed-banners'
