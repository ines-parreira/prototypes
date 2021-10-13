import React from 'react'
import {Button} from 'reactstrap'

import {ConfirmationModal} from '../ConfirmationModal'

import css from './HelpCenterEditModalFooter.less'

type Props = {
    counters?: {charCount: number; wordCount: number}
    canSave: boolean
    canDelete: boolean
    onSave: () => void
    onDelete: () => void
}

export const HelpCenterEditModalFooter = ({
    counters,
    canSave,
    canDelete,
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
            <div>
                <Button
                    disabled={!canSave}
                    color="primary"
                    className={css.submitButton}
                    onClick={onSave}
                >
                    Save Article
                </Button>

                {canDelete && (
                    <Button
                        className={css['delete-btn']}
                        onClick={() => setPendingDeleteArticle(true)}
                    >
                        <i className="material-icons mr-2">delete</i>
                        Delete Article
                    </Button>
                )}
            </div>
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
