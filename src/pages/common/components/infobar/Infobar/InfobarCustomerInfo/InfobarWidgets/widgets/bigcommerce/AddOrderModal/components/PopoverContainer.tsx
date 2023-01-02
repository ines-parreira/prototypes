import React, {RefObject} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

import css from './PopoverContainer.less'

export const PopoverContainer = ({
    body,
    footer,
    isOpen,
    onToggle,
    target,
}: {
    isOpen: boolean
    onToggle: () => void
    target: RefObject<HTMLButtonElement | null>
    body: React.ReactNode
    footer: React.ReactNode
}) => (
    <Dropdown isOpen={isOpen} onToggle={onToggle} target={target}>
        <DropdownBody
            className={css.body}
            onClick={(event) => {
                // stop event from propagating to modal and closing it
                event.stopPropagation()
            }}
        >
            {body}
        </DropdownBody>

        <div className={css.footer}>{footer}</div>
    </Dropdown>
)
