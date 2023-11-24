import React, {useState} from 'react'

import Tooltip from 'pages/common/components/Tooltip'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'

import css from './DrillDownDownloadButton.less'

export const DOWNLOAD_REQUESTED_LABEL = 'Download Requested'
const NO_PERMISSIONS_CONTENT =
    'You don’t have enough permissions to download this content.'
const tooltipTargetID = 'download-drill-down-tooltip'

export const DrillDownDownloadButton = () => {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const [requestDownload, setRequestDownload] = useState(false)
    const isDisabled = !(
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)
    )

    return (
        <>
            <Button
                id={tooltipTargetID}
                isDisabled={isDisabled}
                fillStyle="ghost"
                {...(!requestDownload && {
                    onClick: () => {
                        setRequestDownload(true)
                        void dispatch(
                            notify({
                                message: `<strong>${657} tickets</strong> will be exported. You will receive the download link via email at <strong>${
                                    currentUser.get('email') as string
                                }</strong> once the export is done.`,
                                allowHTML: true,
                                status: NotificationStatus.Success,
                            })
                        )
                    },
                })}
            >
                {requestDownload ? (
                    <ButtonIconLabel
                        className={css.success}
                        icon="check"
                        position="left"
                    >
                        {DOWNLOAD_REQUESTED_LABEL}
                    </ButtonIconLabel>
                ) : (
                    <ButtonIconLabel icon="download" position="left">
                        Download {657} tickets
                    </ButtonIconLabel>
                )}
            </Button>
            <Tooltip
                disabled={!isDisabled}
                target={tooltipTargetID}
                trigger={['hover']}
            >
                {NO_PERMISSIONS_CONTENT}
            </Tooltip>
        </>
    )
}
