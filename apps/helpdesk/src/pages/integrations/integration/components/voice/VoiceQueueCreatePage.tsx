import { history } from '@repo/routing'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { CreateVoiceQueue } from '@gorgias/helpdesk-queries'
import { useCreateVoiceQueues } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import VoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceQueueEditOrCreateForm from './VoiceQueueEditOrCreateForm'
import VoiceQueueSettingsForm from './VoiceQueueSettingsForm'

import css from './VoiceQueueCreatePage.less'

export default function VoiceQueueCreatePage() {
    const notify = useNotify()
    const { mutate: createQueue } = useCreateVoiceQueues({
        mutation: {
            onSuccess: (response) => {
                notify.success(
                    `'${response.data.name}' queue was successfully created.`,
                )

                history.push(`${PHONE_INTEGRATION_BASE_URL}/queues`)
            },
            onError: () => {
                notify.error(
                    "We couldn't save your preferences. Please try again.",
                )
            },
        },
    })

    const handleSubmit = async (values: CreateVoiceQueue) => {
        createQueue({ data: values })
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <VoiceQueueSettingsForm onSubmit={handleSubmit}>
                    <VoiceQueueEditOrCreateForm />
                    <div className={css.buttons}>
                        <VoiceFormSubmitButton>
                            Save changes
                        </VoiceFormSubmitButton>
                        <Link to={`${PHONE_INTEGRATION_BASE_URL}/queues`}>
                            <Button intent="secondary">Cancel</Button>
                        </Link>
                    </div>
                </VoiceQueueSettingsForm>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
