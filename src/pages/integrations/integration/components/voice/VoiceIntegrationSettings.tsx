import React, { useState } from 'react'

import { CustomRecordingType } from '@gorgias/api-types'

import { VOICEMAIL_DEFAULT_VOICE_MESSAGE } from 'models/integration/constants'
import {
    PhoneIntegration,
    PhoneIntegrationVoicemailSettings,
} from 'models/integration/types'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import VoiceMessageField from './VoiceMessageField'

type Props = {
    integration: PhoneIntegration
}
function VoiceIntegrationSettings({ integration }: Props) {
    const [payload, setPayload] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <h3>Testing for now</h3>
                <VoiceMessageField
                    value={payload ?? VOICEMAIL_DEFAULT_VOICE_MESSAGE}
                    onChange={(message) => {
                        setPayload((payload) => ({
                            ...message,
                            allow_to_leave_voicemail:
                                payload?.allow_to_leave_voicemail ?? true,
                        }))
                    }}
                    horizontal={true}
                    allowNone
                    customRecordingType={
                        CustomRecordingType.VoicemailNotification
                    }
                    shouldUpload={true}
                />
            </SettingsContent>
        </SettingsPageContainer>
    )
}

export default VoiceIntegrationSettings
