import {SegmentEvent} from 'common/segment'

export const BANNER_DETAILS = {
    CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED: {
        TITLE: 'Build dynamic forms with branching logic using Flows',
        DESCRIPTION: null,
        BUTTON_TEXT: 'Try Flows',
        TRACKING: SegmentEvent.ContactFormRedirectToFlows,
    },
    CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED: {
        TITLE: 'Build dynamic forms with Automate',
        DESCRIPTION:
            'Build fully customizable forms with branching logic to collect customer data.',
        BUTTON_TEXT: 'Learn About Automate',
        TRACKING: SegmentEvent.ContactFormRedirectToAutomate,
    },
    NOT_CONNECTED_TO_SHOP: {
        TITLE: 'Build dynamic forms with Automate',
        DESCRIPTION:
            'First, connect your form to a Shopify store to enable the Flows feature.',
        BUTTON_TEXT: 'Connect Store',
        TRACKING: SegmentEvent.ContactFormRedirectToContactFormPreferences,
    },
}
