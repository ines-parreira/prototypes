/// <reference types="@types/segment-analytics" />
import { isDevelopment } from '@repo/utils'
import _isUndefined from 'lodash/isUndefined'
import notification from 'push.js'

import { devLog } from '../utils/devLog'
import { deprecatedEvents } from './deprecated-events'
import type { SegmentEvent } from './types'

export const SAMPLE_RATE_FOR_HIGH_TRAFFIC = 0.1
const shouldSendEvent = () =>
    !(
        window.USER_IMPERSONATED ||
        _isUndefined(window.analytics) ||
        isDevelopment()
    )

export const logEvent = (event: SegmentEvent, props = {}) => {
    if (deprecatedEvents.includes(event)) {
        devLog('Deprecated Segment Event', event, props)
        return
    }

    devLog('Track Segment', event, props)

    if (!shouldSendEvent()) {
        return
    }

    window.analytics.track(event, props)
}

export const logEventWithSampling = (
    event: SegmentEvent,
    props = {},
    sampleRate = SAMPLE_RATE_FOR_HIGH_TRAFFIC,
) => {
    if (Math.random() <= sampleRate) {
        logEvent(event, props)
    }
}

type GorgiasUser = {
    name: string
    email: string
    country: string
    role: {
        name: string
    }
    created_datetime: string
    notification_permission: string
}

export const identifyUser = <U extends GorgiasUser>(user: U) => {
    if (!shouldSendEvent()) {
        return
    }
    const domain = window.location.hostname.split('.')[0]

    window.analytics.identify(window.SEGMENT_ANALYTICS_USER_ID, {
        gorgias_subdomain: domain,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.role.name,
        created_at: user.created_datetime,
        notification_permission: notification.Permission.get(),
    })
}

export const logPageChange = () => {
    if (!shouldSendEvent()) {
        return
    }

    window.analytics.page()
}
