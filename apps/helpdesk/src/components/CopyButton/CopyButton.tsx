import type { MouseEvent } from 'react'
import React from 'react'

import { reportError } from '@repo/logging'
import copy from 'copy-to-clipboard'

import { toast } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'

import css from './CopyButton.less'

export default function CopyButton({
    value,
    onCopyMessage = 'Copied!',
}: {
    value: string
    onCopyMessage?: string
}) {
    const handleCopy = (e: MouseEvent) => {
        e.stopPropagation()
        try {
            copy(value)
            toast.success(onCopyMessage)
        } catch (err: unknown) {
            reportError(err as Error)
            toast.error('Failed to copy')
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
