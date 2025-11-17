import type { Map } from 'immutable'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationOutdatedSnippetBanner: React.FC<Props> = ({
    integration,
}) => {
    return (
        <AlertBanner
            type={AlertBannerTypes.Info}
            message="Use Shopify Theme extensions for the best chat experience—faster, more reliable, and ready for upcoming features"
            CTA={{
                type: 'internal',
                text: 'Switch to Theme extensions',
                to: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integration.get('id') as string}/${Tab.Installation}`,
            }}
        />
    )
}

export default GorgiasChatIntegrationOutdatedSnippetBanner
