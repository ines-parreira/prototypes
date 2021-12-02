import React, {memo, useCallback, useState} from 'react'
import {
    Button,
    ButtonDropdown,
    ButtonGroup,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'
import {Map} from 'immutable'

import {renderTemplate} from '../../../../../../../../utils/template'

import {Button as ButtonType} from '../types'

import css from './ActionButtons.less'

const NB_BUTTONS_DISPLAYED = 2

type Props = {
    buttons: ButtonType[]
    source: Map<string, unknown>
}

function ButtonsGroup({buttons, source}: Props) {
    const [isDropdownOpen, setDropdownOpen] = useState(false)

    const toggleDropdown = useCallback(() => {
        setDropdownOpen((isDropdownOpen) => !isDropdownOpen)
    }, [])

    const displayedButtons = buttons.slice(0, NB_BUTTONS_DISPLAYED)
    const dropdownButtons = buttons.slice(NB_BUTTONS_DISPLAYED)
    return (
        <ButtonGroup className={css.actionButtons}>
            {displayedButtons.map((button, index) => {
                return (
                    <Button
                        type="button"
                        className={css.actionButton}
                        key={index}
                    >
                        {renderTemplate(button.label, source.toJS())}
                    </Button>
                )
            })}
            {dropdownButtons.length > 0 && (
                <ButtonDropdown
                    className={css.dropdownButton}
                    isOpen={isDropdownOpen}
                    toggle={toggleDropdown}
                >
                    <DropdownToggle className={css.dropdownToggle}>
                        <i className={`material-icons ${css.dropdownIcon}`}>
                            more_horiz
                        </i>
                    </DropdownToggle>
                    <DropdownMenu right>
                        {dropdownButtons.map((button, index) => {
                            return (
                                <DropdownItem
                                    type="button"
                                    key={index}
                                    className={css.dropdownItem}
                                >
                                    {renderTemplate(
                                        button.label,
                                        source.toJS()
                                    )}
                                </DropdownItem>
                            )
                        })}
                    </DropdownMenu>
                </ButtonDropdown>
            )}
        </ButtonGroup>
    )
}

export default memo(ButtonsGroup)
