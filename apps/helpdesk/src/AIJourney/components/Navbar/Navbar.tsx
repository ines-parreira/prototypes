import { NavLink } from 'react-router-dom'

import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'
import useAllIntegrations from 'hooks/useAllIntegrations'
import { IntegrationType } from 'models/integration/constants'
import { getIconFromType } from 'state/integrations/helpers'

import css from './Navbar.less'

export const AiJourneyNavbar = () => {
    const { integrations: shopifyIntegrations } = useAllIntegrations(
        'shopify',
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        },
    )

    const sortedShopifyIntegrations = [...shopifyIntegrations].sort((a, b) =>
        a.name.localeCompare(b.name),
    )

    return (
        <Navbar activeContent={ActiveContent.AiJourney} title="AI Journey">
            <Navigation.Root className={css.navigation}>
                {sortedShopifyIntegrations.map((storeIntegration, index) => {
                    const shopType = storeIntegration.type
                    const shopName = storeIntegration.name

                    return (
                        <Navigation.SectionItem
                            as={NavLink}
                            to={`/app/ai-journey/${shopName}`}
                            displayType="indent"
                            key={index}
                        >
                            <div className={css.navigationTrigger}>
                                <img
                                    alt={`${shopType} logo`}
                                    role="presentation"
                                    src={getIconFromType(
                                        shopType as IntegrationType,
                                    )}
                                />
                                {shopName}
                            </div>
                        </Navigation.SectionItem>
                    )
                })}
            </Navigation.Root>
        </Navbar>
    )
}
