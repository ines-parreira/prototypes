import {BANNER_DETAILS} from './constants'

export const getBannerDetails = (
    isSubscribedToAutomation: boolean,
    contactFormId: number,
    shopName: string | null
) => {
    if (!shopName) {
        return {
            title: BANNER_DETAILS.NOT_CONNECTED_TO_SHOP.TITLE,
            description: BANNER_DETAILS.NOT_CONNECTED_TO_SHOP.DESCRIPTION,
            button: {
                text: BANNER_DETAILS.NOT_CONNECTED_TO_SHOP.BUTTON_TEXT,
                icon: null,
                link: `/app/settings/contact-form/${contactFormId}/preferences`,
            },
            track: BANNER_DETAILS.NOT_CONNECTED_TO_SHOP.TRACKING,
        }
    }

    if (isSubscribedToAutomation) {
        return {
            title: BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED
                .TITLE,
            description:
                BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED
                    .DESCRIPTION,
            button: {
                text: BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED
                    .BUTTON_TEXT,
                icon: null,
                link: `/app/automation/shopify/${shopName}/flows`,
            },
            track: BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED
                .TRACKING,
        }
    }

    return {
        title: BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED.TITLE,
        description:
            BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED
                .DESCRIPTION,
        button: {
            text: BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED
                .BUTTON_TEXT,
            icon: 'bolt',
            link: '/app/automation',
        },
        track: BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED
            .TRACKING,
    }
}
