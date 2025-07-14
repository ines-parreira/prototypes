import { useFormContext } from 'react-hook-form'

import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
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

export const CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV = 0.05

type Props = {
    description?: string
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}

export const ConversationLauncherSettings = ({
    description = 'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
    gmv,
    isGmvLoading,
}: Props) => {
    const { watch, setValue } = useFormContext()
    const isAskAnythingInputEnabled = watch('isAskAnythingInputEnabled')

    const potentialImpact = usePotentialImpact(
        CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleToggle = () =>
        setValue('isAskAnythingInputEnabled', !isAskAnythingInputEnabled, {
            shouldDirty: true,
        })

    return (
        <>
            <EngagementSettingsCard>
                <EngagementSettingsCardContentWrapper>
                    <EngagementSettingsCardImage
                        alt="image showing an example of the Ask anything input"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_floating_input_small.png',
                        )}
                        className={css.cardImage}
                    />

                    <EngagementSettingsCardContent>
                        <div className={css.cardHeader}>
                            <EngagementSettingsCardTitle>
                                Ask anything input
                            </EngagementSettingsCardTitle>

                            <EngagementSettingsCardImpact
                                icon="lock"
                                impact={potentialImpact}
                                isLoading={isGmvLoading}
                                isChecked={isAskAnythingInputEnabled}
                            />
                        </div>

                        <EngagementSettingsCardDescription>
                            {description}
                        </EngagementSettingsCardDescription>
                    </EngagementSettingsCardContent>
                    <EngagementSettingsCardToggle
                        isChecked={isAskAnythingInputEnabled}
                        onChange={handleToggle}
                    />
                </EngagementSettingsCardContentWrapper>
            </EngagementSettingsCard>
        </>
    )
}
