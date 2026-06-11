import { FormField } from '@repo/forms'

import NewToggleField from 'pages/common/forms/NewToggleField'

function VoiceIntegrationSettingSpamPrevention() {
    return (
        <FormField
            name="meta.preferences.spam_prevention"
            label={
                'Notify agents by indicating "Maybe spam" for incoming calls'
            }
        >
            {(field) => <NewToggleField {...field} />}
        </FormField>
    )
}

export default VoiceIntegrationSettingSpamPrevention
