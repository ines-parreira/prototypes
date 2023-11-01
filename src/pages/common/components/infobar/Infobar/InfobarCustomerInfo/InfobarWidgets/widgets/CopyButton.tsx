import copy from 'copy-to-clipboard'
import React, {MouseEvent, useContext} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import IconButton from 'pages/common/components/button/IconButton'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import css from './CopyButton.less'

export const Copy = ({
    value,
    name,
    className,
    onCopyMessage = 'Copied!',
}: {
    value: string
    name: string
    className: string
    onCopyMessage?: string
}) => {
    const dispatch = useAppDispatch()
    const {integration} = useContext(IntegrationContext)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const copyContent = async (e: MouseEvent) => {
        e.stopPropagation()
        logEvent(SegmentEvent.InfobarFieldCopied, {
            account_domain: currentAccount.get('domain'),
            name: name,
            integration_type: integration.get('type'),
        })
        try {
            copy(value)
            await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    title: onCopyMessage,
                })
            )
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'Failed to copy',
                })
            )
            reportError(err as Error)
        }
    }

    return (
        <span className={className}>
            <IconButton
                className={css.iconButton}
                iconClassName={`material-icons ${css.copyIcon}`}
                fillStyle="ghost"
                size="small"
                onClick={copyContent}
            >
                content_copy
            </IconButton>
        </span>
    )
}
