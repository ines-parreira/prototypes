import React from 'react'
import {
    Button,
    UncontrolledButtonDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
    ButtonGroup,
} from 'reactstrap'

import css from './HelpCenterEditModalFooter.less'

type Props = {
    canSave: boolean
    onSave: () => void
    onDelete: () => void
}

export const HelpCenterEditModalFooter = ({
    canSave,
    onSave,
    onDelete,
}: Props) => {
    return (
        <footer className={css.footer}>
            <ButtonGroup>
                <Button
                    disabled={!canSave}
                    type="submit"
                    color="primary"
                    className={css.submitButton}
                >
                    Save
                </Button>
                <UncontrolledButtonDropdown className={css.dropdownButton}>
                    <DropdownToggle caret />
                    <DropdownMenu className={css.dropdownMenu} right>
                        <DropdownItem onClick={onDelete}>
                            <span className={css.danger}>
                                <i className="material-icons mr-2">delete</i>
                                Delete
                            </span>
                        </DropdownItem>
                        <DropdownItem disabled={!canSave} onClick={onSave}>
                            <i className="material-icons mr-2">save</i>Save
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </ButtonGroup>
        </footer>
    )
}

export default HelpCenterEditModalFooter
