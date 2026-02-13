import type { MouseEvent } from 'react'
import React, { useCallback, useState } from 'react'

import { RichUtils } from 'draft-js'

import { HEADER_ONE, HEADER_THREE, HEADER_TWO } from '../constants'
import type { ActionInjectedProps } from '../types'
import ButtonPopover from './ButtonPopover'

import css from './HeadingPicker.less'

const HEADING_OPTIONS = [
    { label: 'Heading 1', blockType: HEADER_ONE },
    { label: 'Heading 2', blockType: HEADER_TWO },
    { label: 'Heading 3', blockType: HEADER_THREE },
] as const

type Props = ActionInjectedProps

const HeadingPicker = ({
    getEditorState,
    setEditorState,
    isDisabled = false,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const editorState = getEditorState()
    const currentBlockType = RichUtils.getCurrentBlockType(editorState)
    const isActive = HEADING_OPTIONS.some(
        (opt) => opt.blockType === currentBlockType,
    )

    const handleOpen = useCallback(() => {
        setIsOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleSelect = useCallback(
        (blockType: string) => {
            const editorState = getEditorState()
            setEditorState(RichUtils.toggleBlockType(editorState, blockType))
            setIsOpen(false)
        },
        [getEditorState, setEditorState],
    )

    return (
        <ButtonPopover
            name="Heading"
            icon="title"
            isActive={isActive}
            isDisabled={isDisabled}
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
        >
            <div
                className={css.headingMenu}
                onMouseDown={(e: MouseEvent) => e.preventDefault()}
            >
                {HEADING_OPTIONS.map(({ label, blockType }) => (
                    <button
                        key={blockType}
                        className={css.headingOption}
                        data-active={
                            currentBlockType === blockType ? true : undefined
                        }
                        onClick={() => handleSelect(blockType)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </ButtonPopover>
    )
}

export default HeadingPicker
