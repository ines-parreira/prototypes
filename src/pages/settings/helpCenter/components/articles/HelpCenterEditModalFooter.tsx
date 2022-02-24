import React, {useState} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import {Rating} from 'models/helpCenter/types'
import Tooltip from '../../../../common/components/Tooltip'
import {articleRequiredFields} from '../../utils/helpCenter.utils'
import {ConfirmationModal} from '../ConfirmationModal'
import {useRatingScore} from '../../hooks/useRatingScore'

import star from '../../../../../../img/icons/rating-star.svg'
import up from '../../../../../../img/icons/rating-up.svg'
import down from '../../../../../../img/icons/rating-down.svg'
import {
    ArticleMode,
    ArticleModeModified,
    ArticleModeNew,
    ArticleModeUnchangedNotPublished,
    canDelete,
} from '../../types/articleMode'
import css from './HelpCenterEditModalFooter.less'

type Props = {
    rating?: Rating
    canSave: boolean
    requiredFields: typeof articleRequiredFields
    onDiscard: () => void
    counters?: {charCount: number}
    articleMode: ArticleMode
}

export const HelpCenterEditModalFooter: React.FC<Props> = ({
    rating,
    canSave,
    requiredFields,
    onDiscard,
    counters,
    articleMode,
}: Props) => {
    const [pendingDeleteArticle, setPendingDeleteArticle] = useState(false)

    const handleOnDeleteConfirm = () => {
        if (canDelete(articleMode)) {
            void articleMode.onDelete()
        }
        setPendingDeleteArticle(false)
    }

    const ratingScore = useRatingScore(rating)

    const buttonsForModified = (mode: ArticleModeModified) => (
        <UncontrolledButtonDropdown
            direction="up"
            id="article-save-button-wrapper"
        >
            <Button
                isDisabled={!canSave}
                onClick={() => mode.onSave(true)}
                color="primary"
            >
                Save &amp; Publish
            </Button>
            {canSave && <DropdownToggle caret color="primary" />}
            {requiredFields.length >= 1 && (
                <Tooltip
                    disabled={canSave}
                    placement="top-start"
                    target="article-save-button-wrapper"
                >
                    You need to add a {requiredFields[0]}
                </Tooltip>
            )}

            <DropdownMenu right style={{width: '100%'}}>
                <DropdownItem onClick={() => mode.onSave(false)}>
                    Save Changes
                </DropdownItem>
                <DropdownItem onClick={() => mode.onSave(true)}>
                    Save &amp; Publish
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    )

    const buttonsForNew = (mode: ArticleModeNew) => (
        <UncontrolledButtonDropdown
            direction="up"
            id="article-save-button-wrapper"
        >
            <Button
                onClick={() => mode.onCreate(true)}
                isDisabled={!canSave}
                color="primary"
            >
                Create &amp; Publish
            </Button>
            {canSave && <DropdownToggle caret color="primary" />}
            {requiredFields.length >= 1 && (
                <Tooltip
                    disabled={canSave}
                    placement="top-start"
                    target="article-save-button-wrapper"
                >
                    You need to add a {requiredFields[0]}
                </Tooltip>
            )}

            <DropdownMenu right style={{width: '100%'}}>
                <DropdownItem onClick={() => mode.onCreate(false)}>
                    Create Article
                </DropdownItem>
                <DropdownItem onClick={() => mode.onCreate(true)}>
                    Create &amp; Publish
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    )

    const buttonsForUnchangedPublished = () => (
        <Button
            className={css.submitButton}
            intent={ButtonIntent.Primary}
            type="button"
            isDisabled={true}
        >
            Published
        </Button>
    )

    const buttonsForUnchangedNotPublished = (
        mode: ArticleModeUnchangedNotPublished
    ) => (
        <Button
            className={css.submitButton}
            intent={ButtonIntent.Primary}
            type="button"
            onClick={mode.onPublish}
        >
            Publish Article
        </Button>
    )

    const savingButtons = (articleMode: ArticleMode) => {
        switch (articleMode.mode) {
            case 'new':
                return buttonsForNew(articleMode)
            case 'modified':
                return buttonsForModified(articleMode)
            case 'unchanged_not_published':
                return buttonsForUnchangedNotPublished(articleMode)
            default:
                return buttonsForUnchangedPublished()
        }
    }

    return (
        <footer className={css.footer}>
            <div className={css.buttonsWrapper}>
                {savingButtons(articleMode)}

                <Button
                    intent={ButtonIntent.Secondary}
                    type="button"
                    onClick={onDiscard}
                >
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
                {canDelete(articleMode) && (
                    <Button
                        className={css.deleteButton}
                        intent={ButtonIntent.Secondary}
                        type="button"
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
                    onConfirm={handleOnDeleteConfirm}
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
