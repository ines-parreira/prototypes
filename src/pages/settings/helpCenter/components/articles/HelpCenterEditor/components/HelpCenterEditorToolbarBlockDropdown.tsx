import React from 'react'
import {
    UncontrolledDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'
import classNames from 'classnames'

import css from './HelpCenterEditorToolbarBlockDropdown.less'
import {HelpCenterEditorToolbarSeparator} from './HelpCenterEditorToolbarSeparator'

export const blockOptions = [
    'Normal',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'Blockquote',
    'Code',
] as const

type Props = {
    onChange: (blockType: string) => void
    currentState: {
        blockType: string
    }
}

export const HelpCenterEditorToolbarBlockDropdown = ({
    currentState,
    onChange,
}: Props) => {
    return (
        <>
            <UncontrolledDropdown className={css.dropdown}>
                <DropdownToggle className={css.dropdownToggle} caret>
                    {currentState.blockType || (
                        <span className={css.placeholder}>Block type</span>
                    )}
                </DropdownToggle>
                <DropdownMenu>
                    {blockOptions.map((blockType) => (
                        <DropdownItem
                            key={blockType}
                            className={classNames({
                                [css.dropdownItem]: true,
                                [css.activeItem]:
                                    currentState.blockType === blockType,
                            })}
                            onClick={() => onChange(blockType)}
                        >
                            {blockType}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </UncontrolledDropdown>
            <HelpCenterEditorToolbarSeparator />
        </>
    )
}
