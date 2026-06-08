import { useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useCopyToClipboard, useTimeout } from '@repo/hooks'

import { Icon } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './CopyButton.less'

type CopyButtonProps = {
    text: string
}

export function CopyButton({ text }: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false)
    const [, copyToClipboard] = useCopyToClipboard()
    const [setTimeout] = useTimeout()

    const handleCopy = () => {
        copyToClipboard(text)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), Duration.seconds(2))
    }

    return (
        <span
            role="button"
            className={css.trigger}
            onClick={handleCopy}
            aria-label="Copy message"
        >
            <Icon name={(isCopied ? 'check' : 'copy') as IconName} size="sm" />
        </span>
    )
}
