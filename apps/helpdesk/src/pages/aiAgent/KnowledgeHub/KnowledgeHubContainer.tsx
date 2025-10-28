import useAppSelector from 'hooks/useAppSelector'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { KnowledgeHubHeader } from './KnowledgeHubHeader/KnowledgeHubHeader'

import css from './KnowledgeHubContainer.less'

export const KnowledgeHubContainer = () => {
    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    const routeShopName = extractShopNameFromUrl(window.location.href)
    const shopName = routeShopName || allShopifyIntegrations[0]?.meta?.shop_name

    return (
        <div className={css.container}>
            <KnowledgeHubHeader shopName={shopName} data={null} />
        </div>
    )
}
