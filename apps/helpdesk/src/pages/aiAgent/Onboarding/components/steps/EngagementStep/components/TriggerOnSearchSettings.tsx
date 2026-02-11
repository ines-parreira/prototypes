import { useFormContext } from 'react-hook-form'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
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

export const TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV = 0.04

type Props = {
    description?: string
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}

export const TriggerOnSearchSettings = ({
    description = 'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
    gmv,
    isGmvLoading,
}: Props) => {
    const { watch, setValue } = useFormContext()
    const isSalesHelpOnSearchEnabled = watch('isSalesHelpOnSearchEnabled')

    const potentialImpact = usePotentialImpact(
        TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleToggle = () =>
        setValue('isSalesHelpOnSearchEnabled', !isSalesHelpOnSearchEnabled, {
            shouldDirty: true,
        })

    return (
        <EngagementSettingsCard>
            <EngagementSettingsCardContentWrapper>
                <EngagementSettingsCardImage
                    alt="image showing an example of the Search Assist"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_trigger_on_search_small.png',
                    )}
                    className={css.cardImage}
                />

                <EngagementSettingsCardContent>
                    <div className={css.cardHeader}>
                        <EngagementSettingsCardTitle>
                            Search Assist
                        </EngagementSettingsCardTitle>

                        <EngagementSettingsCardImpact
                            icon="lock"
                            impact={potentialImpact}
                            isLoading={isGmvLoading}
                            isChecked={isSalesHelpOnSearchEnabled}
                        />
                    </div>

                    <EngagementSettingsCardDescription>
                        {description}
                    </EngagementSettingsCardDescription>
                </EngagementSettingsCardContent>
                <EngagementSettingsCardToggle
                    isChecked={isSalesHelpOnSearchEnabled}
                    onChange={handleToggle}
                />
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
