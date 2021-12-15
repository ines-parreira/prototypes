import React, {ChangeEvent, ReactChild, useEffect, useRef} from 'react'

import {LocaleCode} from '../../../../../models/helpCenter/types'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import {useLocales} from '../../hooks/useLocales'
import {useEditionManager} from '../../providers/EditionManagerContext'
import {isExistingArticle} from '../../utils/helpCenter.utils'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'

import ArticleCategorySelect from './ArticleCategorySelect'

import css from './HelpCenterEditModalHeader.less'

export type Props = {
    title: string
    isFullscreen?: boolean
    supportedLocales: LocaleCode[]
    helpCenterId: number
    onTitleChange?: (title: string) => void
    onLanguageSelect: (localeCode: LocaleCode) => void
    onResize?: () => void
    onClose: () => void
    onArticleLanguageSelectActionClick: (
        action: ActionType,
        currentOption: OptionItem
    ) => void
    toggleModalBtn?: ReactChild
    autoFocus?: boolean
    showCategorySelect?: boolean
}

export const HelpCenterEditModalHeader = ({
    title,
    isFullscreen,
    supportedLocales,
    onTitleChange,
    onClose,
    onResize,
    onLanguageSelect,
    onArticleLanguageSelectActionClick,
    toggleModalBtn,
    helpCenterId,
    autoFocus = false,
    showCategorySelect = false,
}: Props) => {
    const locales = useLocales()
    const titleInputRef = useRef<HTMLInputElement | null>(null)

    const {
        selectedCategoryId,
        setSelectedCategoryId,
        selectedArticle,
        selectedArticleLanguage,
    } = useEditionManager()

    const articleLocales = isExistingArticle(selectedArticle)
        ? selectedArticle.available_locales
        : undefined

    const getResizeModalButton = () =>
        isFullscreen ? (
            <button
                type="button"
                className={css.controlButton}
                onClick={onResize}
                aria-label="halfscreen modal"
            >
                <i className="material-icons">fullscreen_exit</i>
            </button>
        ) : (
            <button
                type="button"
                className={css.controlButton}
                onClick={onResize}
                aria-label="fullscreen modal"
            >
                <i className="material-icons">fullscreen</i>
            </button>
        )

    const localeSelectOptions = React.useMemo(
        () =>
            getLocaleSelectOptions(locales, supportedLocales).map((option) => {
                let isComplete = false
                let canBeDeleted = true

                if (articleLocales) {
                    isComplete = articleLocales.includes(option.value)
                    canBeDeleted = articleLocales.length > 1
                }

                return {
                    ...option,
                    isComplete,
                    canBeDeleted,
                }
            }),
        [locales, supportedLocales, articleLocales]
    )

    useEffect(() => {
        if (autoFocus) {
            // Only set the auto-focus after the drawer animation is finished,
            // otherwise it breaks the animation
            setTimeout(
                () => titleInputRef.current?.focus(),
                DRAWER_TRANSITION_DURATION_MS
            )
        }
    }, [autoFocus])

    return (
        <header className={css.header}>
            <div className={css.headerTopContainer}>
                {onTitleChange ? (
                    <input
                        type="text"
                        value={title}
                        placeholder="Title"
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onTitleChange(event.target.value)
                        }
                        className={css.titleInput}
                        maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                        ref={titleInputRef}
                    />
                ) : (
                    <span className={css.titleInput}>{title}</span>
                )}
                <div className={css.headerControls}>
                    <ArticleLanguageSelect
                        selected={selectedArticleLanguage}
                        list={localeSelectOptions}
                        onSelect={onLanguageSelect}
                        onActionClick={onArticleLanguageSelectActionClick}
                    />
                    {toggleModalBtn}
                    {onResize && getResizeModalButton()}
                    <button
                        type="button"
                        className={css.controlButton}
                        onClick={onClose}
                        aria-label="close modal"
                    >
                        <i className="material-icons mr-2">keyboard_tab</i>
                    </button>
                </div>
            </div>
            <div className={css.break} />
            {showCategorySelect && selectedCategoryId !== undefined && (
                <div className={css.categorySelect}>
                    <ArticleCategorySelect
                        locale={selectedArticleLanguage}
                        helpCenterId={helpCenterId}
                        categoryId={selectedCategoryId}
                        onChange={(value: number | null) => {
                            setSelectedCategoryId(value)
                        }}
                    />
                </div>
            )}
        </header>
    )
}

export default HelpCenterEditModalHeader
