import _isUndefined from 'lodash/isUndefined'

const analytics = window.analytics

/**
 * Log event in Segment
 * @param event (name of event. ex: 'agent-created')
 * @param props (object of props)
 */
export const logEvent = (event, props = {}) => {
    if (_isUndefined(analytics)) {
        return
    }

    // in dev env do not send data to Segment
    if (window.DEVELOPMENT || window.STAGING) {
        return console.log('Track Segment', event, props)
    }

    analytics.track(event, props)
}

/**
 * Identify current user in Segment
 * @param user
 */
export const identifyUser = (user) => {
    if (_isUndefined(analytics)) {
        return
    }

    const domain = window.location.hostname.split('.')[0]

    const userId = user.id.toString()
    const userData = {
        account_id: user.account_id,
        domain: domain,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.roles[0].name,
        created_at: user.created_datetime,
    }

    // in dev env do not send data to Segment
    if (window.DEVELOPMENT || window.STAGING) {
        return console.log('Identify Segment user', userId, userData)
    }

    analytics.identify(userId, userData)
}

export const EVENTS = {
    BOOK_CALL_CLICKED: 'book-call-clicked',
    EXTERNAL_LINK_CLICKED: 'external-link-clicked',
    INFOBAR_ACTION_CLICKED: 'infobar-action-clicked',
    INFOBAR_INTEGRATION_ADD_CLICKED: 'infobar-integration-add-clicked',
    INTEGRATION_CLICKED: 'integration-clicked',
    MODAL_TOGGLED: 'modal-toggled',
    NAVBAR_VIEW_MOVED: 'navbar-view-moved',
    NAVBAR_VIEW_TOGGLED: 'navbar-view-toggled',
    ONBOARDING_WIDGET_CLICKED: 'onboarding-widget-clicked',
    RECENT_ACTIVITY_CLICKED: 'recent-activity-clicked',
    SHOW_MORE_FIELDS_CLICKED: 'show-more-fields-clicked',
    USER_HISTORY_TOGGLED: 'user-history-toggled',
    USER_MERGE_CLICKED: 'user-merge-clicked',
    VIEW_FILTER_ADD_CLICKED: 'view-filter-add-clicked',
}
