import { Link } from 'react-router-dom'

import { PhoneIntegration } from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from './useVoiceSettingsForm'
import GenericVoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceFormUnsavedChangesPrompt from './VoiceFormUnsavedChangesPrompt'
import VoiceIntegrationSettingsFormCallFlowSection from './VoiceIntegrationSettingsFormCallFlowSection'
import VoiceIntegrationSettingsFormGeneralSection from './VoiceIntegrationSettingsFormGeneralSection'

import css from './VoiceIntegrationSettingsForm.less'

type Props = {
    integration: PhoneIntegration
}

function VoiceIntegrationSettingsForm({ integration }: Props): JSX.Element {
    const { onSubmit } = useFormSubmit(integration)
    const { isDeleting, performDelete } = useDeletePhoneIntegration(integration)

    return (
        <>
            <div className={css.container}>
                <div className={css.section}>
                    <h2>General</h2>
                    <VoiceIntegrationSettingsFormGeneralSection
                        integration={integration}
                    />
                </div>
                <div className={css.section}>
                    <div>
                        <h2>Call flow</h2>
                        <p className={css.sectionDescription}>
                            Configure how incoming calls are handled
                        </p>
                    </div>
                    <VoiceIntegrationSettingsFormCallFlowSection />
                </div>
            </div>
            <div className={css.buttons}>
                <div className={css.mainActions}>
                    <GenericVoiceFormSubmitButton>
                        Save changes
                    </GenericVoiceFormSubmitButton>
                    <Link to={`${PHONE_INTEGRATION_BASE_URL}/integrations`}>
                        <Button intent="secondary">Cancel</Button>
                    </Link>
                </div>
                <ConfirmButton
                    className="float-right"
                    intent="destructive"
                    fillStyle="ghost"
                    isLoading={isDeleting}
                    onConfirm={() => performDelete({ id: integration.id })}
                    confirmationContent={INTEGRATION_REMOVAL_CONFIGURATION_TEXT}
                >
                    Delete integration
                </ConfirmButton>
            </div>
            <VoiceFormUnsavedChangesPrompt onSave={onSubmit} />
        </>
    )
}

export default VoiceIntegrationSettingsForm
