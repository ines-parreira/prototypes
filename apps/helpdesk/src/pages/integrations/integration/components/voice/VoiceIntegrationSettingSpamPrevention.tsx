import { FormField } from 'core/forms'
import NewToggleField from 'pages/common/forms/NewToggleField'

function VoiceIntegrationSettingSpamPrevention() {
    return (
        <FormField
            name="meta.preferences.spam_prevention"
            field={NewToggleField}
            label={
                'Notify agents by indicating "Maybe spam" for incoming calls'
            }
        />
    )
}

export default VoiceIntegrationSettingSpamPrevention
