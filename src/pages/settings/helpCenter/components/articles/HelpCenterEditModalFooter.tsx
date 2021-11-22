import React, {FormEvent} from 'react'
import {Button} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'
import {articleRequiredFields} from '../../utils/helpCenter.utils'
import {ConfirmationModal} from '../ConfirmationModal'

import css from './HelpCenterEditModalFooter.less'

type Props = {
    counters?: {charCount: number; wordCount: number}
    canSave: boolean
    requiredFields: typeof articleRequiredFields
    canDelete: boolean
    onSave: () => void
    onDelete: () => void
}

export const HelpCenterEditModalFooter = ({
    counters,
    canSave,
    canDelete,
    onSave,
    requiredFields,
    onDelete,
}: Props): JSX.Element => {
    const [pendingDeleteArticle, setPendingDeleteArticle] =
        React.useState(false)

    const handleOnSave = (event: FormEvent) => {
        event.preventDefault()
        onSave()
    }

    const handleOnClickConfirm = () => {
        onDelete()
        setPendingDeleteArticle(false)
    }

    return (
        <footer className={css.footer}>
            <div className={css.buttonsWrapper}>
                <div id="article-save-button-wrapper">
                    <Button
                        disabled={!canSave}
                        color="primary"
                        onClick={handleOnSave}
                        className={css.submitButton}
                    >
                        Save Article
                    </Button>
                </div>
                {requiredFields?.length >= 1 && (
                    <Tooltip
                        disabled={canSave}
                        placement="top-start"
                        target="article-save-button-wrapper"
                    >
                        You need to add a {requiredFields[0]}
                    </Tooltip>
                )}

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
