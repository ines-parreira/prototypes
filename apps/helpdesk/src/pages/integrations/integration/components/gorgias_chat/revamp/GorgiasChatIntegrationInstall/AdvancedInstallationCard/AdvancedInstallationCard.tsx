import { useState } from 'react'

import type { Map } from 'immutable'

import {
    Button,
    ButtonAs,
    ButtonIntent,
    ButtonVariant,
    Card,
    Elevation,
    Heading,
    Icon,
    Text,
} from '@gorgias/axiom'

import AdvancedInstallationSidePanel from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/AdvancedInstallationCard/AdvancedInstallationSidePanel'

import css from './AdvancedInstallationCard.less'

type Props = {
    integration: Map<any, any>
}

const AdvancedInstallationCard = ({ integration }: Props) => {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

    return (
        <Card elevation={Elevation.Mid}>
            <div>
                <div>
                    <Heading size="md">Advanced Installation</Heading>
                </div>
                <div className={css.cardDescription}>
                    <Text>
                        Manually install the chat widget on non-Shopify sites,
                        Shopify Headless, or specific Shopify pages.
                    </Text>
                </div>
                <div className={css.cardFooter}>
                    <Button
                        intent={ButtonIntent.Regular}
                        variant={ButtonVariant.Secondary}
                        as={ButtonAs.Button}
                        onClick={() => setIsSidePanelOpen(true)}
                    >
                        Install with code
                    </Button>
                    <Text>
                        <a
                            href="https://docs.gorgias.com/en-US/configure-chat-for-your-gorgias-helpdesk-81789"
                            target="_blank"
                            className={css.iconLink}
                        >
                            Learn more <Icon name="external-link" />
                        </a>
                    </Text>
                </div>
            </div>
            <AdvancedInstallationSidePanel
                isOpen={isSidePanelOpen}
                onOpenChange={(open) => setIsSidePanelOpen(open)}
                integration={integration}
            />
        </Card>
    )
}

export default AdvancedInstallationCard
