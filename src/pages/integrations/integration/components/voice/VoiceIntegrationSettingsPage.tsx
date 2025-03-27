import { useParams } from 'react-router-dom'

import {
    PhoneIntegration,
    UpdateAllPhoneIntegrationSettings,
    useGetIntegration,
} from '@gorgias/api-queries'
import {
    isPhoneIntegration,
    validateUpdateAllPhoneIntegrationSettings,
} from '@gorgias/api-validators'

import { Form, toFormErrors } from 'core/forms'
import Loader from 'pages/common/components/Loader/Loader'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { getDefaultValues, useFormSubmit } from './useVoiceSettingsForm'
import VoiceIntegrationSettingsForm from './VoiceIntegrationSettingsForm'

function VoiceIntegrationSettingsPage() {
    const { integrationId: idParam } = useParams<{ integrationId: string }>()
    const id = Number(idParam)
    const { isFetching, data } = useGetIntegration(id, {
        query: { refetchOnWindowFocus: false },
    })

    const integration = data?.data as PhoneIntegration
    const { onSubmit } = useFormSubmit(integration)

    if (isFetching) {
        return <Loader />
    }

    if (!isPhoneIntegration(integration)) {
        return <div />
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <Form
                    onValidSubmit={onSubmit}
                    defaultValues={getDefaultValues(integration)}
                    mode="onChange"
                    resetOptions={{
                        keepDirty: false,
                        keepDefaultValues: false,
                        keepDirtyValues: false,
                    }}
                    validator={(values: UpdateAllPhoneIntegrationSettings) => {
                        return toFormErrors(
                            validateUpdateAllPhoneIntegrationSettings(values),
                        )
                    }}
                >
                    <VoiceIntegrationSettingsForm integration={integration} />
                </Form>
            </SettingsContent>
        </SettingsPageContainer>
    )
}

export default VoiceIntegrationSettingsPage
