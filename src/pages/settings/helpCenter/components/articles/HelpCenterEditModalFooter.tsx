import React, {FormEvent, useState} from 'react'
import {Button} from 'reactstrap'

import {Rating} from 'models/helpCenter/types'
import Tooltip from '../../../../common/components/Tooltip'
import {articleRequiredFields} from '../../utils/helpCenter.utils'
import {ConfirmationModal} from '../ConfirmationModal'
import {useRatingScore} from '../../hooks/useRatingScore'

import star from '../../../../../../img/icons/rating-star.svg'
import up from '../../../../../../img/icons/rating-up.svg'
import down from '../../../../../../img/icons/rating-down.svg'
import css from './HelpCenterEditModalFooter.less'

type Props = {
    rating?: Rating
    canSave: boolean
    canDelete: boolean
    requiredFields: typeof articleRequiredFields
    onSave: () => void
    onDelete: () => void
    onDiscard: () => void
    counters?: {charCount: number}
}

export const HelpCenterEditModalFooter: React.FC<Props> = ({
    rating,
    canSave,
    canDelete,
    requiredFields,
    onSave,
    onDelete,
    onDiscard,
    counters,
}: Props) => {
    const [pendingDeleteArticle, setPendingDeleteArticle] = useState(false)

    const handleOnSave = (event: FormEvent) => {
        event.preventDefault()
        onSave()
    }

    const handleOnClickConfirm = () => {
        onDelete()
        setPendingDeleteArticle(false)
    }

    const ratingScore = useRatingScore(rating)

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
                {requiredFields.length >= 1 && (
                    <Tooltip
                        disabled={canSave}
                        placement="top-start"
                        target="article-save-button-wrapper"
                    >
                        You need to add a {requiredFields[0]}
                    </Tooltip>
                )}
                <Button name="discard" onClick={onDiscard}>
                    Discard changes
                </Button>

                {rating && (
                    <div className={css.rating}>
                        <div className={css['rating-text']}>Rating:</div>
                        <img
                            className={css['rating-star']}
                            alt="star"
                            src={star}
                        />
                        <div>{ratingScore}%</div>
                        <div className={css['rating-separator']}>|</div>
                        <div className={css['rating-thumbs']}>
                            <div>
                                <img
                                    alt="up"
                                    className={css['rating-icon']}
                                    src={up}
                                />
                                {rating.up}
                            </div>
                            <div>
                                <img
                                    alt="down"
                                    className={css['rating-icon']}
                                    src={down}
                                />
                                {rating.down}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className={css.buttonsWrapper}>
                {counters && (
                    <div className={css.counter}>
                        Characters: {counters.charCount}
                    </div>
                )}
                {canDelete && (
                    <Button
                        className={css.deleteButton}
                        onClick={() => setPendingDeleteArticle(true)}
                    >
                        <i className="material-icons">delete</i>
                        Delete Article
                    </Button>
                )}
            </div>

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
