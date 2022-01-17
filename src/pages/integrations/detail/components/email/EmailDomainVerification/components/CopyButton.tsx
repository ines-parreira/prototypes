import React from 'react'
import Clipboard from 'clipboard'

import IconButton from 'pages/common/components/button/IconButton'
import {ButtonIntent} from 'pages/common/components/button/Button'
import {store} from '../../../../../../../init'
import {notify} from '../../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../../state/notifications/types'

import css from '../EmailDomainVerification.less'

type Props = {
    clipboardTarget: string
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
            }) as any
        )
    })
}

const CopyButton = ({clipboardTarget}: Props) => {
    return (
        <IconButton
            iconClassName="material-icons-outlined"
            intent={ButtonIntent.Secondary}
            data-clipboard-target={clipboardTarget}
            ref={clipboardCopy}
            className={css['copy-button']}
        >
            content_copy
        </IconButton>
    )
}

export default CopyButton
