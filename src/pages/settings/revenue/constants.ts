import {ProductDetail} from 'pages/common/components/ProductDetail/types'

export const CLICK_TRACKING_BASE_PATH = '/app/settings/revenue/click-tracking'

export const ABOUT_PAGE: ProductDetail = {
    title: 'Click Tracking',
    description: 'Track clicks back to your store.',
    longDescription:
        'With the Gorgias click tracking service you can now track clicks back to your store from short-links sent via help desk conversations. This feature can be used in any channel with standard Gorgias branded links or you can customize your links to match your store’s domain. Simply edit the DNS/custom domain settings in the “manage” section above and the links sent to customers will automatically reference your domain!',
    infocard: {isHidden: true},
    icon: 'link',
}
