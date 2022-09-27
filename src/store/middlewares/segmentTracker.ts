/// <reference types="@types/segment-analytics" />
import _isUndefined from 'lodash/isUndefined'
import notification from 'push.js'

import {devLog} from '../../utils'
import {isDevelopment} from '../../utils/environment'
import {User} from '../../config/types/user'

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

export enum SegmentEvent {
    BookCallClicked = 'book-call-clicked',
    CustomerNoteEdited = 'customer-note-edited',
    DisplayAllEventsClicked = 'display-all-events-clicked',
    ExternalLinkClicked = 'external-link-clicked',
    InfobarIntegrationAddClicked = 'infobar-integration-add-clicked',
    IntegrationClicked = 'integration-clicked',
    IntegrationConnectClicked = 'integration-connect-clicked',
    IntegrationDisconnectClicked = 'integration-disconnect-clicked',
    IntentFeedbackUserSubmission = 'intent-feedback-user-submission',
    IntentFeedbackDropdownOpen = 'intent-feedback-dropdown-open',
    ModalToggled = 'modal-toggled',
    MacroAppliedSearchbar = 'macro-applied-searchbar',
    MacroDefaultMacroToSearch = 'macro-default-macro-to-search',
    MacrosExportClicked = 'macros-export-clicked',
    MacrosImportClicked = 'macros-import-clicked',
    TopRankMacro = 'top-rank-macro',
    MacrosQuickReplyTooltip = 'macros-quick-reply-tooltip',
    MacrosQuickReplyGetDetails = 'macros-quick-reply-get-details',
    MacrosQuickReplySent = 'macros-quick-reply-sent',
    NavbarViewMoved = 'navbar-view-moved',
    NavbarViewToggled = 'navbar-view-toggled',
    OnboardingWidgetClicked = 'onboarding-widget-clicked',
    PaymentMethodAddClicked = 'payment-method-add-clicked',
    PaymentMethodAdded = 'payment-method-added',
    RuleDebbugingCollapsed = 'rule/debugging/collapsed',
    RuleDebbugingExpanded = 'rule/debugging/expanded',
    RuleDebuggingTicketVisited = 'rule/debugging/ticket-visited',
    RuleLibraryVisited = 'rule-library/visited',
    RuleLibraryItemShown = 'rule-library/item-shown',
    RuleLibraryItemInstalled = 'rule-library/item-installed',
    RecentActivityClicked = 'recent-activity-clicked',
    ShopifyCancelOrderCancel = 'shopify/cancel-order/cancel',
    ShopifyCancelOrderOpen = 'shopify/cancel-order/open',
    ShopifyCreateOrderCancel = 'shopify/create-order/cancel',
    ShopifyEditOrderDiscountPopoverOpen = 'shopify/edit-order/discount-popover/open',
    ShopifyEditOrderDiscountPopoverApply = 'shopify/edit-order/discount-popover/apply',
    ShopifyEditOrderDiscountPopoverRemove = 'shopify/edit-order/discount-popover/remove',
    ShopifyEditOrderDiscountPopoverClose = 'shopify/edit-order/discount-popover/close',
    ShopifyCreateOrderCustomItemPopoverCancel = 'shopify/create-order/custom-item-popover/cancel',
    ShopifyCreateOrderCustomItemPopoverOpen = 'shopify/create-order/custom-item-popover/open',
    ShopifyCreateOrderCustomItemPopoverSave = 'shopify/create-order/custom-item-popover/save',
    ShopifyCreateOrderDiscountPopoverApply = 'shopify/create-order/discount-popover/apply',
    ShopifyCreateOrderDiscountPopoverClose = 'shopify/create-order/discount-popover/close',
    ShopifyCreateOrderDiscountPopoverOpen = 'shopify/create-order/discount-popover/open',
    ShopifyCreateOrderDiscountPopoverRemove = 'shopify/create-order/discount-popover/remove',
    ShopifyCreateOrderEmailInvoicePopoverCancel = 'shopify/create-order/email-invoice-popover/cancel',
    ShopifyCreateOrderEmailInvoicePopoverOpen = 'shopify/create-order/email-invoice-popover/open',
    ShopifyCreateOrderEmailInvoicePopoverSend = 'shopify/create-order/email-invoice-popover/send',
    ShopifyCreateOrderLineItemAdded = 'shopify/create-order/line-item/added',
    ShopifyEditOrderLineItemAdded = 'shopify/edit-order/line-item/added',
    ShopifyEditOrderLineItemQuantityChanged = 'shopify/edit-order/line-item/quantity/changed',
    ShopifyCreateOrderLineItemQuantityChanged = 'shopify/create-order/line-item/quantity/changed',
    ShopifyCreateOrderNotesChanged = 'shopify/create-order/notes/changed',
    ShopifyCreateOrderShippingPopoverApply = 'shopify/create-order/shipping-popover/apply',
    ShopifyCreateOrderShippingPopoverClose = 'shopify/create-order/shipping-popover/close',
    ShopifyCreateOrderShippingPopoverOpen = 'shopify/create-order/shipping-popover/open',
    ShopifyCreateOrderShippingPopoverRemove = 'shopify/create-order/shipping-popover/remove',
    ShopifyCreateOrderTagsChanged = 'shopify/create-order/tags/changed',
    ShopifyCreateOrderTagsSuggestionUsed = 'shopify/create-order/tags/suggestion-used',
    ShopifyCreateOrderTaxesPopoverApply = 'shopify/create-order/taxes-popover/apply',
    ShopifyCreateOrderTaxesPopoverClose = 'shopify/create-order/taxes-popover/close',
    ShopifyCreateOrderTaxesPopoverOpen = 'shopify/create-order/taxes-popover/open',
    ShopifyDuplicateOrderCancel = 'shopify/duplicate-order/cancel',
    ShopifyInsertProductLinkOpen = 'shopify/insert-product-link/open',
    ShopifyInsertProductLinkAdded = 'shopify/insert-product-link/product-link-added',
    ShopifyEditOrderCancel = 'shopify/edit-order/cancel',
    ShopifyEditOrderAddressModalOpen = 'shopify/edit-order-address/modal-opened',
    ShopifyEditOrderAddressAddressDropdownOpen = 'shopify/edit-order-address/customer-address-dropdown-opened',
    ShopifyEditOrderAddressAddressDropdownClick = 'shopify/edit-order-address/customer-address-selected',
    ShopifyEditOrderAddressCancel = 'shopify/edit-order-address/cancelled',
    ShopifyEditOrderAddressEdited = 'shopify/edit-order-address/submitted',
    ShopifyDuplicateOrderCustomItemPopoverCancel = 'shopify/duplicate-order/custom-item-popover/cancel',
    ShopifyDuplicateOrderCustomItemPopoverOpen = 'shopify/duplicate-order/custom-item-popover/open',
    ShopifyDuplicateOrderCustomItemPopoverSave = 'shopify/duplicate-order/custom-item-popover/save',
    ShopifyDuplicateOrderDiscountPopoverApply = 'shopify/duplicate-order/discount-popover/apply',
    ShopifyDuplicateOrderDiscountPopoverClose = 'shopify/duplicate-order/discount-popover/close',
    ShopifyDuplicateOrderDiscountPopoverOpen = 'shopify/duplicate-order/discount-popover/open',
    ShopifyDuplicateOrderDiscountPopoverRemove = 'shopify/duplicate-order/discount-popover/remove',
    ShopifyDuplicateOrderEmailInvoicePopoverCancel = 'shopify/duplicate-order/email-invoice-popover/cancel',
    ShopifyDuplicateOrderEmailInvoicePopoverOpen = 'shopify/duplicate-order/email-invoice-popover/open',
    ShopifyDuplicateOrderEmailInvoicePopoverSend = 'shopify/duplicate-order/email-invoice-popover/send',
    ShopifyDuplicateOrderLineItemAdded = 'shopify/duplicate-order/line-item/added',
    ShopifyDuplicateOrderLineItemQuantityChanged = 'shopify/duplicate-order/line-item/quantity/changed',
    ShopifyDuplicateOrderNotesChanged = 'shopify/duplicate-order/notes/changed',
    ShopifyDuplicateOrderShippingPopoverApply = 'shopify/duplicate-order/shipping-popover/apply',
    ShopifyDuplicateOrderShippingPopoverClose = 'shopify/duplicate-order/shipping-popover/close',
    ShopifyDuplicateOrderShippingPopoverOpen = 'shopify/duplicate-order/shipping-popover/open',
    ShopifyDuplicateOrderShippingPopoverRemove = 'shopify/duplicate-order/shipping-popover/remove',
    ShopifyDuplicateOrderTagsChanged = 'shopify/duplicate-order/tags/changed',
    ShopifyDuplicateOrderTagsSuggestionUsed = 'shopify/duplicate-order/tags/suggestion-used',
    ShopifyDuplicateOrderTaxesPopoverApply = 'shopify/duplicate-order/taxes-popover/apply',
    ShopifyDuplicateOrderTaxesPopoverClose = 'shopify/duplicate-order/taxes-popover/close',
    ShopifyDuplicateOrderTaxesPopoverOpen = 'shopify/duplicate-order/taxes-popover/open',
    ShopifyEditOrderTagEditStarted = 'shopify/edit-order-tag/edit-started',
    ShopifyEditCustomerTagSelect = 'shopify/edit-customer-tag/select',
    ShopifyEditOrderTagsSuggestionUsed = 'shopify/edit-order-tags/suggestion-used',
    ShopifyEditCustomerTagsSuggestionUsed = 'shopify/edit-customer-tags/suggestion-used',
    ShopifyRefundOrderCancel = 'shopify/refund-order/cancel',
    ShopifyRefundOrderOpen = 'shopify/refund-order/open',
    ShowMoreFieldsClicked = 'show-more-fields-clicked',
    SubscribedToDevNewsletter = 'subscribed-to-dev-newsletter',
    TicketMergeClicked = 'ticket-merge-clicked',
    TicketMessageCreated = 'ticket-message-created',
    TicketMacrosSearch = 'ticket-macros-search',
    UserHistoryToggled = 'user-history-toggled',
    UserMergeClicked = 'user-merge-clicked',
    ViewFilterAddClicked = 'view-filter-add-clicked',
    GrammarlyEnabled = 'grammarly-enabled',
    UndoSentMessage = 'undo-sent-message',
    PaywallUpgradeButtonSelected = 'paywall-upgrade-button-selected',
    StatDownloadClicked = 'stat-download-clicked',
    StatViewLinkClicked = 'stat-view-link-clicked',
    CustomActionLinksStart = 'widget/custom-link/start-creation',
    CustomActionLinksAdded = 'widget/custom-link/link-added',
    CustomActionLinksEdited = 'widget/custom-link/link-edited',
    CustomActionLinksDeleted = 'widget/custom-link/link-deleted',
    CustomActionLinksClicked = 'widget/custom-link/link-clicked',
    CustomActionButtonsStart = 'widget/custom-button/start-creation',
    CustomActionButtonsAdded = 'widget/custom-button/button-added',
    CustomActionButtonsEdited = 'widget/custom-button/button-edited',
    CustomActionButtonsDeleted = 'widget/custom-button/button-deleted',
    CustomActionButtonsExecuted = 'widget/custom-button/button-executed',
    CustomActionButtonsParamOpened = 'widget/custom-button/params-modal-opened',
    CustomActionButtonsParamClosed = 'widget/custom-button/params-modal-closed',
    ShopifyProfileClicked = 'widget/shopify-profile-link/link-clicked',
    ShopifyOrderClicked = 'widget/shopify-order-link/link-clicked',
    RechargeProfileClicked = 'widget/recharge-profile-link/link-clicked',
    RechargeSubscriptionClicked = 'widget/recharge-subscription-link/link-clicked',
    RechargeOrderClicked = 'widget/recharge-order-link/link-clicked',
    BigCommerceProfileClicked = 'widget/bigcommerce-profile-link/link-clicked',
    BigCommerceOrderClicked = 'widget/bigcommerce-order-link/link-clicked',
    MenuUserLinkClicked = 'menu-user-link-clicked',
    MenuMainLinkClicked = 'menu-main-link-clicked',
    TicketFailedReview = 'ticket-failed-review',
    TicketMessageFailed = 'ticket-message-failed',
    TwoFaModalOpened = 'access/2fa/setup-modal-opened',
    TwoFaModalCancelled = 'access/2fa/setup-modal-cancelled',
    TwoFaModalBackToQrCode = 'access/2fa/setup-modal-back-to-qrcode-button-clicked',
    QuickResponseFlowCreated = 'quick-response-flow-created',
    QuickResponseFlowDeleted = 'quick-response-flow-deleted',
    QuickResponseFlowEdited = 'quick-response-flow-edited',
    QuickResponseFlowActivated = 'quick-response-flow-activated',
    QuickResponseFlowDeactivated = 'quick-response-flow-deactivated',
    SearchQueryRanked = 'search-query-ranked',
    TeamWizardEntry = 'team-wizard-entry',
    TeamWizardCreatedTeam = 'team-wizard-created-team',
    TeamWizardCreatedRule = 'team-wizard-created-rule',
    ChatPreferencesUpdated = 'chat-preferences-updated',
    SelfServiceActivatedViaBanner = 'self-service-activated-via-banner',
    PrintTicketClicked = 'print-ticket-clicked',
}

export enum StatViewLinkClickedStat {
    TicketsClosedPerAgentTotal = 'tickets-closed-per-agent-total',
    TicketsCreatedPerChannelTotal = 'tickets-created-per-channel-total',
    TicketsCreatedPerTagTotal = 'tickets-created-per-tag-total',
    TicketsOpenPerAgentLive = 'tickets-open-per-agent-live',
    TicketsOpenPerAgentPerChannelLive = 'tickets-open-per-agent-per-channel-live',
}
