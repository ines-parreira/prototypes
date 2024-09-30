import React, {KeyboardEventHandler, RefObject} from 'react'
import {Placement} from '@floating-ui/react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

import css from './PopoverContainer.less'

type PopoverContainerBodyProps = {
    body: React.ReactNode
    footer: React.ReactNode
    onToggle?: () => void
}

export const PopoverContainerBody = ({
    body,
    footer,
    onToggle,
}: PopoverContainerBodyProps) => {
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
        if (event.key === 'Escape') {
            onToggle?.()
        }
    }

    return (
        <>
            <DropdownBody
                className={css.body}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {body}
            </DropdownBody>
            <div className={css.footer} tabIndex={-1} onKeyDown={handleKeyDown}>
                {footer}
            </div>
        </>
    )
}

type PopoverContainerProps = PopoverContainerBodyProps & {
    isOpen: boolean
    target: RefObject<HTMLButtonElement | null>
    dropdownPlacement?: Placement
    onToggle: (isVisible: boolean) => void
}

export const PopoverContainer = ({
    body,
    footer,
    isOpen,
    onToggle,
    target,
    dropdownPlacement = 'bottom-start',
}: PopoverContainerProps) => (
    <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        target={target}
        placement={dropdownPlacement}
    >
        <PopoverContainerBody body={body} footer={footer} onToggle={onToggle} />
    </Dropdown>
)
