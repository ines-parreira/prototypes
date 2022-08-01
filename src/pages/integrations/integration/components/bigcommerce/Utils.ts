import {isProduction, isStaging} from '../../../../../utils/environment'

export function getConnectUrl() {
    const BIGCOMMERCE_MARKETPLACE_BASE_URL =
        'https://apps.bigcommerce.com/details/'
    const BIGCOMMERCE_STAGING_APP_ID = '39647'
    const BIGCOMMERCE_PRODUCTION_APP_ID = '39645'
    const BIGCOMMERCE_DEVELOPMENT_APP_URL =
        'https://store-pk360c6roo.mybigcommerce.com/manage/marketplace/apps/my-apps'
    // compute the right url based on the environment
    let connectUrl = BIGCOMMERCE_DEVELOPMENT_APP_URL
    if (isStaging()) {
        connectUrl =
            BIGCOMMERCE_MARKETPLACE_BASE_URL + BIGCOMMERCE_STAGING_APP_ID
    }
    if (isProduction()) {
        connectUrl =
            BIGCOMMERCE_MARKETPLACE_BASE_URL + BIGCOMMERCE_PRODUCTION_APP_ID
    }
    return connectUrl
}
