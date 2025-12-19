import { useCallback, useState } from 'react'

import { EngagementSettingsCardToggle } from 'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCardToggle'
import { assetsUrl } from 'utils'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from './card/EngagementSettingsCard'

import css from './EmbeddedSpqsSettings.less'

type Props = {
    description?: string
}

export const EmbeddedSpqsSettings = ({
    description = 'Show up to 3 dynamic, AI-generated questions embedded directly in product pages to resolve pre-sales questions and drive conversion.',
}: Props) => {
    const [isEmbeddedFaqsEnabled, setIsEmbeddedFaqsEnabled] = useState(false)

    const handleToggleChange = useCallback((newValue: boolean) => {
        setIsEmbeddedFaqsEnabled(newValue)
    }, [])

    const handleSettingsClick = useCallback(() => {}, [])

    return (
        <EngagementSettingsCard>
            <EngagementSettingsCardContentWrapper>
                <EngagementSettingsCardImage
                    alt="image showing an example of embedded FAQs"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_embedded_faqs_small.png',
                    )}
                />

                <EngagementSettingsCardContent className={css.cardContent}>
                    <div className={css.cardHeader}>
                        <EngagementSettingsCardTitle>
                            Embedded FAQs
                        </EngagementSettingsCardTitle>

                        <EngagementSettingsCardToggle
                            isChecked={isEmbeddedFaqsEnabled}
                            onChange={handleToggleChange}
                            withBadges
                            onSettingsClick={handleSettingsClick}
                        ></EngagementSettingsCardToggle>
                    </div>

                    <EngagementSettingsCardDescription>
                        {description}
                    </EngagementSettingsCardDescription>
                </EngagementSettingsCardContent>
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
