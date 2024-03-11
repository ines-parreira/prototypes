import copy from 'copy-to-clipboard'
import React, {MouseEvent} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {reportError} from 'utils/errors'

import {NotificationStatus} from 'state/notifications/types'
import css from './CopyButton.less'

export default function CopyButton({
    value,
    onCopyMessage = 'Copied!',
}: {
    value: string
    onCopyMessage?: string
}) {
    const dispatch = useAppDispatch()
    const handleCopy = (e: MouseEvent) => {
        e.stopPropagation()
        try {
            copy(value)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    title: onCopyMessage,
                })
            )
        } catch (err: unknown) {
            reportError(err as Error)
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'Failed to copy',
                })
            )
        }
    }

    return (
        <IconButton
            className={css.iconButton}
            iconClassName={`material-icons ${css.copyIcon}`}
            fillStyle="ghost"
            size="small"
            onClick={handleCopy}
        >
            content_copy
        </IconButton>
    )
}
