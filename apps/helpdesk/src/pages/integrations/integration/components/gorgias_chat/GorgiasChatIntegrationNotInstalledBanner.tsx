import type { Map } from 'immutable'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'

type Props = {
    integration: Map<any, any>
    tab?: Tab
}

const GorgiasChatIntegrationNotInstalledBanner: React.FC<Props> = ({
    integration,
    tab,
}) => (
    <AlertBanner
        type={AlertBannerTypes.Critical}
        message="Your chat widget was not seen installed on your website
                        in the past 72 hours. Check its installation and your
                        website to resolve."
        CTA={
            tab === Tab.Installation
                ? {
                      type: 'external',
                      href: 'https://docs.gorgias.com/en-US/chat-getting-started-81789#installation-monitoring',
                      text: 'More Information',
                      opensInNewTab: true,
                  }
                : {
                      type: 'internal',
                      text: 'Install',
                      to: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integration.get('id') as string}/${Tab.Installation}`,
                  }
        }
    />
)

export default GorgiasChatIntegrationNotInstalledBanner
