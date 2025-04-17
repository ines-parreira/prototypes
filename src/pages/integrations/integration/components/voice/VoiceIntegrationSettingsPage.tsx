import { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import {
    PhoneIntegration,
    UpdateAllPhoneIntegrationSettings,
    useGetIntegration,
} from '@gorgias/api-queries'
import { validateUpdateAllPhoneIntegrationSettings } from '@gorgias/api-validators'

import { Form, toFormErrors } from 'core/forms'
import { useNotify } from 'hooks/useNotify'
import { isPhoneIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import { getDefaultValues, useFormSubmit } from './useVoiceSettingsForm'
import VoiceIntegrationSettingsForm from './VoiceIntegrationSettingsForm'

function VoiceIntegrationSettingsPage() {
    const { integrationId: idParam } = useParams<{ integrationId: string }>()
    const id = Number(idParam)
    const { isFetching, data, isError } = useGetIntegration(id, {
        query: { refetchOnWindowFocus: false },
    })
    const notify = useNotify()

    useEffect(() => {
        if (isError) {
            notify.error('Failed to fetch integration')
            history.push(PHONE_INTEGRATION_BASE_URL)
        }
    }, [isError, notify])

    if (isFetching) {
        return <Loader />
    }

    if (isError || !isPhoneIntegration(data?.data)) {
        return <div />
    }

    return <PageContent integration={data.data} />
}

const PageContent = ({ integration }: { integration: PhoneIntegration }) => {
    const { onSubmit } = useFormSubmit(integration)

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
