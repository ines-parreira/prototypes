import React from 'react'
import {
    Button,
    UncontrolledButtonDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
    ButtonGroup,
} from 'reactstrap'

import {ConfirmationModal} from '../ConfirmationModal'

import css from './HelpCenterEditModalFooter.less'

type Props = {
    counters?: {charCount: number; wordCount: number}
    canSave: boolean
    onSave: () => void
    onDelete: () => void
}

export const HelpCenterEditModalFooter = ({
    counters,
    canSave,
    onSave,
    onDelete,
}: Props): JSX.Element => {
    const [pendingDeleteArticle, setPendingDeleteArticle] = React.useState(
        false
    )

    const handleOnClickConfirm = () => {
        onDelete()
        setPendingDeleteArticle(false)
    }

    return (
        <footer className={css.footer}>
            <ButtonGroup>
                <Button
                    disabled={!canSave}
                    color="primary"
                    className={css.submitButton}
                    onClick={onSave}
                >
                    Save Article
                </Button>
                <UncontrolledButtonDropdown className={css.dropdownButton}>
                    <DropdownToggle caret />
                    <DropdownMenu className={css.dropdownMenu} right>
                        <DropdownItem
                            onClick={() => setPendingDeleteArticle(true)}
                        >
                            <span className={css.danger}>
                                <i className="material-icons mr-2">delete</i>
                                Delete Article
                            </span>
                        </DropdownItem>
                        <DropdownItem disabled={!canSave} onClick={onSave}>
                            <i className="material-icons mr-2">save</i>
                            Save Article
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </ButtonGroup>
            {counters && (
                <div className={css.counters}>
                    <span>Words: {counters?.wordCount}</span>
                    <span>Characters: {counters?.charCount}</span>
                </div>
            )}
            {pendingDeleteArticle && (
                <ConfirmationModal
                    isOpen={!!pendingDeleteArticle}
                    confirmText={`Delete article`}
                    title={
                        <span>
                            Are you sure you want to delete this article?
                        </span>
                    }
                    style={{width: '100%', maxWidth: 610}}
                    onClose={() => setPendingDeleteArticle(false)}
                    onConfirm={handleOnClickConfirm}
                >
                    <span>
                        You will lose all content saved and published of this
                        article. You can’t undo this action, you’ll have to
                        compose again all the content for this article if you
                        decide to add it.
                    </span>
                </ConfirmationModal>
            )}
        </footer>
    )
}

export default HelpCenterEditModalFooter
