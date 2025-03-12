import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton } from 'core/forms'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import VoiceQueueSettingsForm from './VoiceQueueSettingsForm'
import VoiceQueueSettingsFormCallFlowSection from './VoiceQueueSettingsFormCallFlowSection'
import VoiceQueueSettingsFormGeneralSection from './VoiceQueueSettingsFormGeneralSection'

import css from './VoiceQueueCreatePage.less'

export default function VoiceQueueCreatePage() {
    return (
        <SettingsPageContainer>
            <SettingsContent>
                <VoiceQueueSettingsForm onSubmit={() => {}}>
                    <VoiceQueueSettingsFormGeneralSection />
                    <VoiceQueueSettingsFormCallFlowSection />
                    <div className={css.buttons}>
                        <FormSubmitButton>Save changes</FormSubmitButton>
                        <Button intent="secondary">Cancel</Button>
                    </div>
                </VoiceQueueSettingsForm>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
