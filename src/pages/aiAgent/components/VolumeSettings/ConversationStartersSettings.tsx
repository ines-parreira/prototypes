import { useFormContext } from 'react-hook-form'

import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'

import css from './ConversationStartersSettings.less'

export const ConversationStartersSettings = ({
    isEnabled,
}: {
    isEnabled: boolean
}) => {
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')

    return (
        <SettingsCard className={css.card}>
            <SettingsCardHeader>
                <SettingsCardTitle>Conversation starters</SettingsCardTitle>
                <p>
                    Display up to 4 AI-generated conversation starters on
                    product pages. Starters are high-quality, relevant, and easy
                    to answer, tailored using your existing knowledge. Note:
                    This overrides Convert campaigns.
                </p>
            </SettingsCardHeader>
            <SettingsCardContent>
                <SettingsFeatureRow
                    title="Enable conversation starters"
                    type="toggle"
                    isChecked={isConversationStartersEnabled}
                    isDisabled={!isEnabled}
                    onChange={() =>
                        setValue(
                            'isConversationStartersEnabled',
                            !isConversationStartersEnabled,
                            {
                                shouldDirty: true,
                            },
                        )
                    }
                />
            </SettingsCardContent>
        </SettingsCard>
    )
}
