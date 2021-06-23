import React, {useState} from 'react'
import {Button} from 'reactstrap'

import type {Macro} from '../../../../../../models/macro/types'

import {PreviewPopover} from './PreviewPopover'

import css from './MacroButton.less'

type Props = {
    macro: Macro
    applyMacro: () => void
    onHover: () => void
}

export const MacroButton = ({macro, applyMacro, onHover}: Props) => {
    const [isPreviewOpen, setPreviewOpen] = useState(false)
    const buttonId = `macro-quick-reply-${macro.id}`
    return (
        <span key={buttonId} className={css.buttonWrapper}>
            <PreviewPopover
                isOpen={isPreviewOpen}
                targetId={buttonId}
                actions={macro.actions}
            />
            <Button
                className={css.button + ' btn btn-secondary btn-sm'}
                onClick={applyMacro}
                onMouseEnter={() => {
                    onHover()
                    setPreviewOpen(true)
                }}
                onMouseLeave={() => setPreviewOpen(false)}
                id={buttonId}
            >
                {macro.name}
            </Button>
        </span>
    )
}
