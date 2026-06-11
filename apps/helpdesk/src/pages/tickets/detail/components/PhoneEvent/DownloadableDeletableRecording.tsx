import { useCallback, useState } from 'react'

import client, { appQueryClient } from '@repo/api-resources'
import type { AxiosError } from 'axios'

import { LegacyButton as Button, toast } from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import { useAppSelector } from 'hooks/useAppSelector'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import { ConfirmButton } from 'pages/common/components/button/ConfirmButton'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole, replaceAttachmentURL } from 'utils'
import { saveFileAsDownloaded } from 'utils/file'

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

    const deleteRecording = useCallback(async () => {
        setIsRequestPending(true)

        try {
            await client.delete(url)

            if (callId) {
                await appQueryClient.refetchQueries(
                    voiceCallsKeys.listRecordings({ call_id: callId }),
                )
            }

            toast.success('Call recording successfully deleted.')
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>

            if (response) {
                toast.error(response.data.error.msg)
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
                toast.error(response.data.error.msg)
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

export { DownloadableDeletableRecording }
