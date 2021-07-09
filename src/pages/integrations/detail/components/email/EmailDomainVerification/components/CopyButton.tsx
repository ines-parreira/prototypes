import React from 'react'
import Clipboard from 'clipboard'
import {Button} from 'reactstrap'

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
        <Button
            data-clipboard-target={clipboardTarget}
            innerRef={clipboardCopy}
            className={css['copy-button']}
        >
            <span className="material-icons-outlined">content_copy</span>
        </Button>
    )
}

export default CopyButton
