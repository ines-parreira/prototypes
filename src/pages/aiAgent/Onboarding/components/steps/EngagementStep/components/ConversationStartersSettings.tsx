import { useFormContext } from 'react-hook-form'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from 'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCard'
import { EngagementSettingsCardImpact } from 'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCardImpact'
import { EngagementSettingsCardToggle } from 'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCardToggle'
import { usePotentialImpact } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact'
import { assetsUrl } from 'utils'

import css from '../EngagementStep.less'

export const CONV_STARTERS_ESTIMATED_INFLUENCED_GMV = 0.17

type Props = {
    description?: string
    isEnabled: boolean
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}

export const ConversationStartersSettings = ({
    description = 'Show up to 3 dynamic, AI-generated questions on product pages, based on what shoppers are most likely to ask—automatically generated from your product content—to resolve doubts quickly and drive more conversions.',
    isEnabled,
    gmv,
    isGmvLoading,
}: Props) => {
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')

    const potentialImpact = usePotentialImpact(
        CONV_STARTERS_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleToggle = () =>
        setValue(
            'isConversationStartersEnabled',
            !isConversationStartersEnabled,
            {
                shouldDirty: true,
            },
        )

    return (
        <EngagementSettingsCard>
            <EngagementSettingsCardContentWrapper>
                <EngagementSettingsCardImage
                    alt="image showing an example of the conversation starters"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_conversation_starters.png',
                    )}
                />

                <EngagementSettingsCardContent>
                    <div className={css.cardHeader}>
                        <EngagementSettingsCardTitle>
                            Suggested product questions
                        </EngagementSettingsCardTitle>

                        <EngagementSettingsCardImpact
                            icon="lock"
                            impact={potentialImpact}
                            isLoading={isGmvLoading}
                            isChecked={isConversationStartersEnabled}
                        />
                    </div>

                    <EngagementSettingsCardDescription>
                        {description}
                    </EngagementSettingsCardDescription>
                </EngagementSettingsCardContent>
                <EngagementSettingsCardToggle
                    isChecked={isConversationStartersEnabled}
                    isDisabled={!isEnabled}
                    onChange={handleToggle}
                />
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
