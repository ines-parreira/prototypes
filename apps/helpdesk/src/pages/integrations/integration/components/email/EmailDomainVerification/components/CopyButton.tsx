import type { ComponentProps } from 'react'
import React from 'react'

import Clipboard from 'clipboard'

import { store } from 'common/store'
import IconButton from 'pages/common/components/button/IconButton'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from '../EmailDomainVerification.less'

type Props = {
    clipboardTarget: string
    fillStyle?: ComponentProps<typeof IconButton>['fillStyle']
}

const clipboardCopy = (button: HTMLButtonElement) => {
    if (!button) {
        return
    }

    const clipboard = new Clipboard(button)
    clipboard.on('success', () => {
        store.dispatch(
            notify({
                status: NotificationStatus.Info,
                message: 'Copied to clipboard!',
            }) as any,
        )
    })
}

const CopyButton = ({ clipboardTarget, fillStyle }: Props) => {
    return (
        <IconButton
            iconClassName="material-icons-outlined"
            intent="secondary"
            data-clipboard-target={clipboardTarget}
            ref={clipboardCopy}
            className={css['copy-button']}
            fillStyle={fillStyle}
        >
            content_copy
        </IconButton>
    )
}

export default CopyButton
