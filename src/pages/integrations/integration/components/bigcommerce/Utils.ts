import {isProduction, isStaging} from '../../../../../utils/environment'

export function getConnectUrl() {
    let connectUrl =
        'https://store-pk360c6roo.mybigcommerce.com/manage/marketplace/apps/my-apps'
    if (isStaging()) {
        connectUrl = 'https://apps.bigcommerce.com/details/39647'
    }
    if (isProduction()) {
        connectUrl =
            'https://store-pk360c6roo.mybigcommerce.com/manage/marketplace/apps/38723' // will replace with published app
    }
    return connectUrl
}
