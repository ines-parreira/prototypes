import React, {useCallback, useMemo, useState} from 'react'

import classNames from 'classnames'
import {Button} from 'reactstrap'
import {AxiosError} from 'axios'
import {connect} from 'react-redux'
import {uniqueId} from 'lodash'
import {Map} from 'immutable'

import DEPRECATED_ConfirmButton from '../../../../common/components/DEPRECATED_ConfirmButton'
import Hoverable from '../../../../common/components/Hoverable'
import {
    Notification,
    NotificationStatus,
} from '../../../../../state/notifications/types'
import client from '../../../../../models/api/resources'
import {notify as notifyAction} from '../../../../../state/notifications/actions'
import {saveFileAsDownloaded} from '../../../../../utils/file'
import * as currentUserSelectors from '../../../../../state/currentUser/selectors'
import {RootState} from '../../../../../state/types'
import {hasRole} from '../../../../../utils'
import {UserRole} from '../../../../../config/types/user'
import Tooltip from '../../../../common/components/Tooltip'

import useAppDispatch from '../../../../../hooks/useAppDispatch'

import css from './DownloadableDeletableRecording.less'

type OwnProps = {
    downloadRecordingURL: string
    deleteRecordingURL: string
    currentUser: Map<any, any>
}

type ButtonProps = {
    hovered: boolean
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

const DeleteButton = ({hovered, url}: ButtonProps) => {
    const {deleteRecording, isRequestPending} = useDeleteRecording(url)
    const tooltipTargetID = useMemo(
        () => uniqueId('delete-button-') + '-tooltip-target',
        []
    )

    return (
        <>
            <DEPRECATED_ConfirmButton
                id={tooltipTargetID}
                className="float-right"
                color={hovered ? 'secondary' : 'default'}
                disabled={isRequestPending}
                confirm={deleteRecording}
                confirmColor="danger"
                content="You are about to delete this call recording. You cannot recover a deleted recording."
            >
                <i
                    className={classNames('material-icons', {
                        'text-danger': hovered,
                    })}
                >
                    delete
                </i>
            </DEPRECATED_ConfirmButton>
            <span>
                <Tooltip target={tooltipTargetID}>Delete recording</Tooltip>
            </span>
        </>
    )
}

const DownloadButton = ({hovered, url}: ButtonProps) => {
    const {downloadRecording, isRequestPending} = useDownloadRecording(url)

    const tooltipTargetID = useMemo(
        () => uniqueId('download-button-') + '-tooltip-target',
        []
    )

    return (
        <>
            <Button
                id={tooltipTargetID}
                data-testid="record-call-button"
                color={hovered ? 'secondary' : 'default'}
                disabled={isRequestPending}
                onClick={downloadRecording}
            >
                <i
                    className={classNames('material-icons', {
                        'text-danger': hovered,
                    })}
                >
                    download
                </i>
            </Button>
            <span>
                <Tooltip target={tooltipTargetID}>Download recording</Tooltip>
            </span>
        </>
    )
}

const HoverableDeleteButton = Hoverable(DeleteButton)
const HoverableDownloadButton = Hoverable(DownloadButton)

const DownloadableDeletableRecording = ({
    downloadRecordingURL,
    deleteRecordingURL,
    currentUser,
}: OwnProps): JSX.Element => (
    <div className={css['recording-wrapper']}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio controls src={downloadRecordingURL} />
        {hasRole(currentUser, UserRole.BasicAgent) && (
            <div className={css['recording-download']}>
                <HoverableDownloadButton url={downloadRecordingURL} />
            </div>
        )}

        {hasRole(currentUser, UserRole.Admin) && (
            <div className={css['recording-delete']}>
                <HoverableDeleteButton url={deleteRecordingURL} />
            </div>
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
