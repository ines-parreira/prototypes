import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './AiAgentNameFormComponent.less'

type AiAgentNameFormComponentProps = {
    agentsName?: string
    agentsUserId?: number
}

export const AiAgentNameFormComponent = ({
    agentsName,
    agentsUserId,
}: AiAgentNameFormComponentProps) => {
    const initialValue = agentsName ?? INITIAL_FORM_VALUES.conversationBot.name

    return (
        <div className={css.formGroup}>
            {
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle id="ai-agent-name-text-area">
                            AI Agent Name
                        </SettingsCardTitle>
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <TextInput
                            data-testid="ai-agent-name-text-area"
                            isDisabled={true}
                            aria-labelledby="ai-agent-name-text-area"
                            placeholder="AI Agent name"
                            value={initialValue}
                        />
                    </SettingsCardContent>
                    <div className={css.formInputFooterInfo}>
                        This name will be used as sign-off in its responses.
                        Changes can also be done in{' '}
                        <a href={`/app/settings/users/${agentsUserId}`}>
                            users settings
                        </a>
                        .
                    </div>
                </SettingsCard>
            }
        </div>
    )
}
