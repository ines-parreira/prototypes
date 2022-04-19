import React, {useMemo} from 'react'
import _noop from 'lodash/noop'
import {Popover, PopoverBody} from 'reactstrap'

import {MacroAction} from '../../../../../../models/macroAction/types'

import {ActionPreviews} from './ActionPreviews/ActionPreviews'
import css from './PreviewPopover.less'

type Props = {
    isOpen: boolean
    targetId: string
    actions: MacroAction[]
}

export const PreviewPopover = ({isOpen, targetId, actions}: Props) => {
    const maxHeight = useMemo(() => {
        const buttonTop = document
            .getElementById(targetId)
            ?.getBoundingClientRect().top
        const viewTop =
            document.getElementById('TicketHeader')?.getBoundingClientRect()
                .bottom || 0
        return buttonTop ? buttonTop - viewTop - 50 : 'fit-content'
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId, isOpen])

    const maxWidth = useMemo(() => {
        const replyEditorContainer = document
            .getElementById('ticket-reply-editor')
            ?.getBoundingClientRect()
        return replyEditorContainer
            ? replyEditorContainer?.right - replyEditorContainer?.left - 34
            : 0
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    return (
        <Popover
            target={targetId}
            isOpen={isOpen}
            toggle={_noop}
            placement="top-end"
            flip={false}
            popperClassName={css.previewPopover}
        >
            <PopoverBody
                className={css.popoverBody}
                style={{
                    maxHeight,
                    maxWidth,
                }}
            >
                <ActionPreviews
                    actions={actions}
                    textPreviewMinWidth={Math.min(200, maxWidth)}
                />
            </PopoverBody>
        </Popover>
    )
}
