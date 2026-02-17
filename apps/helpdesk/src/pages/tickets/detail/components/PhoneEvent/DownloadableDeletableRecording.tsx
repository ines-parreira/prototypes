import { useCallback, useState } from 'react'

import { saveFileAsDownloaded } from '@repo/utils'
import type { AxiosError } from 'axios'

import { LegacyButton as Button } from '@gorgias/axiom'

import { appQueryClient } from 'api/queryClient'
import { UserRole } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import client from 'models/api/resources'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify as notifyAction } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import { hasRole, replaceAttachmentURL } from 'utils'

import css from './DownloadableDeletableRecording.less'

type OwnProps = {
    downloadRecordingURL: string
    deleteRecordingURL: string
    callId?: number
}

type ButtonProps = {
    url: string
    callId?: number
}

function useDeleteRecording(url: string, callId?: number) {
    const [isRequestPending, setIsRequestPending] = useState(false)
    const dispatch = useAppDispatch()

    const deleteRecording = useCallback(async () => {
        setIsRequestPending(true)

        try {
            await client.delete(url)

            const notification: Notification = {
                status: NotificationStatus.Success,
                message: 'Call recording successfully deleted.',
            }

            if (callId) {
                await appQueryClient.refetchQueries(
                    voiceCallsKeys.listRecordings({ call_id: callId }),
                )
            }

            void (await dispatch(notifyAction(notification)))
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>

            if (response) {
                const notification: Notification = {
                    status: NotificationStatus.Error,
                    message: response.data.error.msg,
                }

                void (await dispatch(notifyAction(notification)))
            }
        } finally {
            setIsRequestPending(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRequestPending])

    return {
        deleteRecording,
        isRequestPending,
        setIsRequestPending,
    }
}

export function useDownloadRecording(url: string) {
    const [isRequestPending, setIsRequestPending] = useState(false)
    const dispatch = useAppDispatch()

    const downloadRecording = useCallback(async () => {
        setIsRequestPending(true)

        try {
            const response = await client.get(url, {
                responseType: 'blob',
                transformRequest: (
                    data: Record<string, unknown>,
                    headers: Record<string, unknown>,
                ) => {
                    // We need this in order to prevent CORS policy error.
                    if (headers['X-CSRF-Token']) {
                        delete headers['X-CSRF-Token']
                    }
                    if (headers['X-Gorgias-User-Client']) {
                        delete headers['X-Gorgias-User-Client']
                    }
                    if (headers['X-Gorgias-User-Client']) {
                        delete headers['X-Gorgias-User-Client']
                    }
                    if (headers.common) {
                        // @ts-ignore
                        if (headers.common['X-CSRF-Token']) {
                            // @ts-ignore
                            delete headers.common['X-CSRF-Token']
                        }
                        // @ts-ignore
                        if (headers.common['X-Gorgias-User-Client']) {
                            // @ts-ignore
                            delete headers.common['X-Gorgias-User-Client']
                        }
                    }
                    return data
                },
            })

            saveFileAsDownloaded(`recording.mp3`, response.data, 'audio/mpeg')
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>

            if (response) {
                const notification: Notification = {
                    status: NotificationStatus.Error,
                    message: response.data.error.msg,
                }

                void (await dispatch(notifyAction(notification)))
            }
        } finally {
            setIsRequestPending(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRequestPending])

    return {
        downloadRecording,
        isRequestPending,
        setIsRequestPending,
    }
}

const DeleteButton = ({ url, callId }: ButtonProps) => {
    const { deleteRecording, isRequestPending } = useDeleteRecording(
        url,
        callId,
    )

    return (
        <ConfirmButton
            className={css.button}
            fillStyle="ghost"
            intent="secondary"
            isDisabled={isRequestPending}
            onConfirm={deleteRecording}
            confirmationContent="You are about to delete this call recording. You cannot recover a deleted recording."
        >
            <i className="material-icons">delete</i>
        </ConfirmButton>
    )
}

const DownloadButton = ({ url }: ButtonProps) => {
    const { downloadRecording, isRequestPending } = useDownloadRecording(url)

    return (
        <Button
            className={css.button}
            intent="secondary"
            fillStyle="ghost"
            isDisabled={isRequestPending}
            onClick={downloadRecording}
        >
            <i className="material-icons">download</i>
        </Button>
    )
}

const DownloadableDeletableRecording = ({
    downloadRecordingURL,
    deleteRecordingURL,
    callId,
}: OwnProps): JSX.Element => {
    const replacedDownloadRecordingURL =
        replaceAttachmentURL(downloadRecordingURL)
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css['recording-wrapper']}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                controls
                src={replacedDownloadRecordingURL}
                className={css['recording-controls']}
            />
            {hasRole(currentUser, UserRole.BasicAgent) && (
                <DownloadButton url={replacedDownloadRecordingURL} />
            )}

            {hasRole(currentUser, UserRole.Admin) && (
                <DeleteButton url={deleteRecordingURL} callId={callId} />
            )}
        </div>
    )
}

export default DownloadableDeletableRecording
