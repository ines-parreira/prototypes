import { useEffect } from 'react'

import { Link, useParams } from 'react-router-dom'

import {
    UpdateVoiceQueue,
    useGetVoiceQueue,
    useUpdateVoiceQueue,
} from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { useNotify } from 'hooks/useNotify'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import { getVoiceQueueEditableFields } from './utils'
import VoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceQueueEditOrCreateForm from './VoiceQueueEditOrCreateForm'
import VoiceQueueSettingsForm from './VoiceQueueSettingsForm'

import css from './VoiceQueueCreatePage.less'

export default function VoiceQueueEditPage() {
    const { id: idParam } = useParams<{ id: string }>()
    const id = Number(idParam)
    const notify = useNotify()

    const {
        data: queue,
        isFetching,
        isError,
    } = useGetVoiceQueue(id, undefined, {
        query: { refetchOnWindowFocus: false },
    })

    const { mutate: updateQueue } = useUpdateVoiceQueue({
        mutation: {
            onSuccess: (response) => {
                notify.success(
                    `'${response.data.name}' queue was successfully updated.`,
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

    useEffect(() => {
        if (isError) {
            notify.error(
                'Something went wrong while fetching the queue. Please try again.',
            )
            history.push(`${PHONE_INTEGRATION_BASE_URL}/queues`)
        }
    }, [isError, notify])

    const handleSubmit = async (values: UpdateVoiceQueue) => {
        updateQueue({ pk: id, data: values })
    }

    if (isFetching || !queue) {
        return <Loader />
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <VoiceQueueSettingsForm<UpdateVoiceQueue>
                    onSubmit={handleSubmit}
                    initialValues={getVoiceQueueEditableFields(queue.data)}
                >
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
