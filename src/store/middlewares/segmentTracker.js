import _isUndefined from 'lodash/isUndefined'

import {devLog} from '../../utils'

const analytics = window.analytics

/**
 * Log event in Segment
 * @param event (name of event. ex: 'agent-created')
 * @param props (object of props)
 */
export const logEvent = (event, props = {}) => {
    devLog('Track Segment', event, props)

    if (
        window.USER_IMPERSONATED ||
        _isUndefined(analytics) ||
        window.DEVELOPMENT
    ) {
        return
    }

    analytics.track(event, props)
}

/**
 * Identify current user in Segment
 * @param user
 */
export const identifyUser = (user) => {
    if (window.USER_IMPERSONATED || _isUndefined(analytics)) {
        return
    }

    const domain = window.location.hostname.split('.')[0]

    analytics.identify(window.SEGMENT_ANALYTICS_USER_ID, {
        gorgias_subdomain: domain,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.roles[0].name,
        created_at: user.created_datetime,
    })
}

export const EVENTS = {
    BOOK_CALL_CLICKED: 'book-call-clicked',
    CUSTOMER_NOTE_EDITED: 'customer-note-edited',
    DISPLAY_ALL_EVENTS_CLICKED: 'display-all-events-clicked',
    EXTERNAL_LINK_CLICKED: 'external-link-clicked',
    HELP_CENTER_CLICKED: 'help-center-clicked',
    INFOBAR_ACTION_CLICKED: 'infobar-action-clicked',
    INFOBAR_INTEGRATION_ADD_CLICKED: 'infobar-integration-add-clicked',
    INTEGRATION_CLICKED: 'integration-clicked',
    MODAL_TOGGLED: 'modal-toggled',
    NAVBAR_VIEW_MOVED: 'navbar-view-moved',
    NAVBAR_VIEW_TOGGLED: 'navbar-view-toggled',
    ONBOARDING_WIDGET_CLICKED: 'onboarding-widget-clicked',
    PAYMENT_METHOD_ADD_CLICKED: 'payment-method-add-clicked',
    PAYMENT_METHOD_ADDED: 'payment-method-added',
    RECENT_ACTIVITY_CLICKED: 'recent-activity-clicked',
    SHOPIFY_CANCEL_ORDER_CANCEL: 'shopify/cancel-order/cancel',
    SHOPIFY_CANCEL_ORDER_OPEN: 'shopify/cancel-order/open',
    SHOPIFY_CREATE_ORDER_CANCEL: 'shopify/create-order/cancel',
    SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_CANCEL:
        'shopify/create-order/custom-item-popover/cancel',
    SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_OPEN:
        'shopify/create-order/custom-item-popover/open',
    SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_SAVE:
        'shopify/create-order/custom-item-popover/save',
    SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_APPLY:
        'shopify/create-order/discount-popover/apply',
    SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_CLOSE:
        'shopify/create-order/discount-popover/close',
    SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_OPEN:
        'shopify/create-order/discount-popover/open',
    SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_REMOVE:
        'shopify/create-order/discount-popover/remove',
    SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_CANCEL:
        'shopify/create-order/email-invoice-popover/cancel',
    SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_OPEN:
        'shopify/create-order/email-invoice-popover/open',
    SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_SEND:
        'shopify/create-order/email-invoice-popover/send',
    SHOPIFY_CREATE_ORDER_LINE_ITEM_ADDED:
        'shopify/create-order/line-item/added',
    SHOPIFY_CREATE_ORDER_LINE_ITEM_QUANTITY_CHANGED:
        'shopify/create-order/line-item/quantity/changed',
    SHOPIFY_CREATE_ORDER_NOTES_CHANGED: 'shopify/create-order/notes/changed',
    SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_APPLY:
        'shopify/create-order/shipping-popover/apply',
    SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_CLOSE:
        'shopify/create-order/shipping-popover/close',
    SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_OPEN:
        'shopify/create-order/shipping-popover/open',
    SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_REMOVE:
        'shopify/create-order/shipping-popover/remove',
    SHOPIFY_CREATE_ORDER_TAGS_CHANGED: 'shopify/create-order/tags/changed',
    SHOPIFY_CREATE_ORDER_TAXES_POPOVER_APPLY:
        'shopify/create-order/taxes-popover/apply',
    SHOPIFY_CREATE_ORDER_TAXES_POPOVER_CLOSE:
        'shopify/create-order/taxes-popover/close',
    SHOPIFY_CREATE_ORDER_TAXES_POPOVER_OPEN:
        'shopify/create-order/taxes-popover/open',
    SHOPIFY_DUPLICATE_ORDER_CANCEL: 'shopify/duplicate-order/cancel',
    SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_CANCEL:
        'shopify/duplicate-order/custom-item-popover/cancel',
    SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_OPEN:
        'shopify/duplicate-order/custom-item-popover/open',
    SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_SAVE:
        'shopify/duplicate-order/custom-item-popover/save',
    SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_APPLY:
        'shopify/duplicate-order/discount-popover/apply',
    SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_CLOSE:
        'shopify/duplicate-order/discount-popover/close',
    SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_OPEN:
        'shopify/duplicate-order/discount-popover/open',
    SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_REMOVE:
        'shopify/duplicate-order/discount-popover/remove',
    SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_CANCEL:
        'shopify/duplicate-order/email-invoice-popover/cancel',
    SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_OPEN:
        'shopify/duplicate-order/email-invoice-popover/open',
    SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_SEND:
        'shopify/duplicate-order/email-invoice-popover/send',
    SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_ADDED:
        'shopify/duplicate-order/line-item/added',
    SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_QUANTITY_CHANGED:
        'shopify/duplicate-order/line-item/quantity/changed',
    SHOPIFY_DUPLICATE_ORDER_NOTES_CHANGED:
        'shopify/duplicate-order/notes/changed',
    SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_APPLY:
        'shopify/duplicate-order/shipping-popover/apply',
    SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_CLOSE:
        'shopify/duplicate-order/shipping-popover/close',
    SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_OPEN:
        'shopify/duplicate-order/shipping-popover/open',
    SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_REMOVE:
        'shopify/duplicate-order/shipping-popover/remove',
    SHOPIFY_DUPLICATE_ORDER_TAGS_CHANGED:
        'shopify/duplicate-order/tags/changed',
    SHOPIFY_DUPLICATE_ORDER_TAXES_POPOVER_APPLY:
        'shopify/duplicate-order/taxes-popover/apply',
    SHOPIFY_DUPLICATE_ORDER_TAXES_POPOVER_CLOSE:
        'shopify/duplicate-order/taxes-popover/close',
    SHOPIFY_DUPLICATE_ORDER_TAXES_POPOVER_OPEN:
        'shopify/duplicate-order/taxes-popover/open',
    SHOPIFY_REFUND_ORDER_CANCEL: 'shopify/refund-order/cancel',
    SHOPIFY_REFUND_ORDER_OPEN: 'shopify/refund-order/open',
    SHOW_MORE_FIELDS_CLICKED: 'show-more-fields-clicked',
    SUBSCRIBED_TO_DEV_NEWSLETTER: 'subscribed-to-dev-newsletter',
    TICKET_MERGE_CLICKED: 'ticket-merge-clicked',
    TICKET_MESSAGE_CREATED: 'ticket-message-created',
    USER_HISTORY_TOGGLED: 'user-history-toggled',
    USER_MERGE_CLICKED: 'user-merge-clicked',
    VIEW_FILTER_ADD_CLICKED: 'view-filter-add-clicked',
    GRAMMARLY_ENABLED: 'grammarly-enabled',
}
