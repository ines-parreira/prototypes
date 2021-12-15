import React, {ChangeEvent, ReactChild, useEffect, useRef} from 'react'

import {HelpCenter, LocaleCode} from '../../../../../models/helpCenter/types'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import {useLocales} from '../../hooks/useLocales'
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
    helpCenter: HelpCenter
    language: LocaleCode
    isFullscreen?: boolean
    supportedLocales: LocaleCode[]
    articleLocales?: LocaleCode[]
    selectedCategoryId?: number | null
    onTitleChange?: (title: string) => void
    onCategorySelect?: (categoryId: number | null) => void
    onLanguageSelect: (localeCode: LocaleCode) => void
    onResize?: () => void
    onClose: () => void
    onArticleLanguageSelectActionClick: (
        action: ActionType,
        currentOption: OptionItem
    ) => void
    toggleModalBtn?: ReactChild
    autoFocus?: boolean
}

export const HelpCenterEditModalHeader = ({
    title,
    helpCenter,
    isFullscreen,
    language,
    supportedLocales,
    articleLocales,
    onTitleChange,
    onCategorySelect,
    onClose,
    onResize,
    onLanguageSelect,
    onArticleLanguageSelectActionClick,
    toggleModalBtn,
    selectedCategoryId,
    autoFocus = false,
}: Props): JSX.Element => {
    const locales = useLocales()
    const titleInputRef = useRef<HTMLInputElement | null>(null)

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
                        selected={language}
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
            {onCategorySelect && selectedCategoryId !== undefined && (
                <div className={css.categorySelect}>
                    <ArticleCategorySelect
                        locale={language}
                        helpCenterId={helpCenter.id}
                        categoryId={selectedCategoryId}
                        onChange={(value: number | null) => {
                            onCategorySelect(value)
                        }}
                    />
                </div>
            )}
        </header>
    )
}

export default HelpCenterEditModalHeader
