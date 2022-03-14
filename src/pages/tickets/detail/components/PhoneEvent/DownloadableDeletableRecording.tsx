import React, {useCallback, useState} from 'react'

import {AxiosError} from 'axios'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {Notification, NotificationStatus} from 'state/notifications/types'
import client from 'models/api/resources'
import {notify as notifyAction} from 'state/notifications/actions'
import {saveFileAsDownloaded} from 'utils/file'
import * as currentUserSelectors from 'state/currentUser/selectors'
import {RootState} from 'state/types'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'

import css from './DownloadableDeletableRecording.less'

type OwnProps = {
    downloadRecordingURL: string
    deleteRecordingURL: string
    currentUser: Map<any, any>
}

type ButtonProps = {
    url: string
}

function useDeleteRecording(url: string) {
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

            void (await dispatch(notifyAction(notification)))
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>

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
    }, [isRequestPending])

    return {
        deleteRecording,
        isRequestPending,
        setIsRequestPending,
    }
}

function useDownloadRecording(url: string) {
    const [isRequestPending, setIsRequestPending] = useState(false)
    const dispatch = useAppDispatch()

    const downloadRecording = useCallback(async () => {
        setIsRequestPending(true)

        try {
            const response = await client.get(url, {
                responseType: 'blob',
                transformRequest: (
                    data: Record<string, unknown>,
                    headers: Record<string, unknown>
                ) => {
                    // We need this in order to prevent CORS policy error.
                    delete headers['X-CSRF-Token'] // @ts-ignore
                    delete headers['X-Gorgias-User-Client'] // @ts-ignore
                    delete headers.common['X-CSRF-Token'] // @ts-ignore
                    delete headers.common['X-Gorgias-User-Client'] // @ts-ignore
                    return data
                },
            })

            saveFileAsDownloaded(`recording.mp3`, response.data, 'audio/mpeg')
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>

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
    }, [isRequestPending])

    return {
        downloadRecording,
        isRequestPending,
        setIsRequestPending,
    }
}

const DeleteButton = ({url}: ButtonProps) => {
    const {deleteRecording, isRequestPending} = useDeleteRecording(url)

    return (
        <ConfirmButton
            className="float-right"
            intent="destructive"
            isDisabled={isRequestPending}
            onConfirm={deleteRecording}
            confirmationContent="You are about to delete this call recording. You cannot recover a deleted recording."
        >
            <i className="material-icons">delete</i>
        </ConfirmButton>
    )
}

const DownloadButton = ({url}: ButtonProps) => {
    const {downloadRecording, isRequestPending} = useDownloadRecording(url)

    return (
        <Button
            intent="secondary"
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
    currentUser,
}: OwnProps): JSX.Element => (
    <div className={css['recording-wrapper']}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
            controls
            src={downloadRecordingURL}
            className={css['recording-controls']}
        />
        {hasRole(currentUser, UserRole.BasicAgent) && (
            <DownloadButton url={downloadRecordingURL} />
        )}

        {hasRole(currentUser, UserRole.Admin) && (
            <DeleteButton url={deleteRecordingURL} />
        )}
    </div>
)

const mapStateToProps = (state: RootState) => {
    return {
        currentUser: currentUserSelectors.getCurrentUser(state),
    }
}

const connector = connect(mapStateToProps)
export default connector(DownloadableDeletableRecording)
