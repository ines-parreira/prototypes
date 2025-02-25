import { SegmentEvent } from 'common/segment'

import { getBannerDetails } from '../utils'

describe('getBannerDetails', () => {
    it('should return banner details for subscribed user with shop name', () => {
        const isSubscribedToAutomation = true
        const contactFormId = 123
        const shopName = 'example-shop'

        const result = getBannerDetails(
            isSubscribedToAutomation,
            contactFormId,
            shopName,
        )

        expect(result).toEqual({
            title: 'Build dynamic forms with branching logic using Flows',
            description: null,
            button: {
                text: 'Try Flows',
                icon: null,
                link: '/app/automation/shopify/example-shop/flows',
            },
            track: SegmentEvent.ContactFormRedirectToFlows,
        })
    })

    it('should return banner details for unsubscribed user with shop name', () => {
        const isSubscribedToAutomation = false
        const contactFormId = 123
        const shopName = 'example-shop'

        const result = getBannerDetails(
            isSubscribedToAutomation,
            contactFormId,
            shopName,
        )

        expect(result).toEqual({
            title: 'Build dynamic forms with Automate',
            description:
                'Build fully customizable forms with branching logic to collect customer data.',
            button: {
                text: 'Learn About Automate',
                icon: 'bolt',
                link: '/app/automation',
            },
            track: SegmentEvent.ContactFormRedirectToAutomate,
        })
    })

    it('should return banner details for user without shop name', () => {
        const isSubscribedToAutomation = false
        const contactFormId = 123
        const shopName = null

        const result = getBannerDetails(
            isSubscribedToAutomation,
            contactFormId,
            shopName,
        )

        expect(result).toEqual({
            title: 'Build dynamic forms with Automate',
            description:
                'First, connect your form to a Shopify store to enable the Flows feature.',
            button: {
                text: 'Connect Store',
                icon: null,
                link: '/app/settings/contact-form/123/preferences',
            },
            track: SegmentEvent.ContactFormRedirectToContactFormPreferences,
        })
    })
})
