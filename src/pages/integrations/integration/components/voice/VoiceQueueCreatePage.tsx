import { Link } from 'react-router-dom'

import { CreateVoiceQueue, useCreateVoiceQueues } from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import VoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceQueueEditOrCreateForm from './VoiceQueueEditOrCreateForm'
import VoiceQueueSettingsForm from './VoiceQueueSettingsForm'

import css from './VoiceQueueCreatePage.less'

export default function VoiceQueueCreatePage() {
    const dispatch = useAppDispatch()
    const { mutate: createQueue } = useCreateVoiceQueues({
        mutation: {
            onSuccess: (response) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `'${response.data.name}' queue was successfully created.`,
                    }),
                )

                history.push(`${PHONE_INTEGRATION_BASE_URL}/queues`)
            },
            onError: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            "We couldn't save your preferences. Please try again.",
                    }),
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
