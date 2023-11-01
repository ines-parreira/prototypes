/// <reference types="@types/segment-analytics" />
import _isUndefined from 'lodash/isUndefined'
import notification from 'push.js'

import {User} from 'config/types/user'
import {devLog} from 'utils'
import {isDevelopment} from 'utils/environment'

import {SegmentEvent} from './types'

const shouldSendEvent = () =>
    !(
        window.USER_IMPERSONATED ||
        _isUndefined(window.analytics) ||
        isDevelopment()
    )

export const logEvent = (event: SegmentEvent, props = {}) => {
    devLog('Track Segment', event, props)

    if (!shouldSendEvent()) {
        return
    }

    window.analytics.track(event, props)
}

export const identifyUser = (user: User) => {
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
