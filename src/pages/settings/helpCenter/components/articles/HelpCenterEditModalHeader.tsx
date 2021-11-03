import React, {ChangeEvent, ReactChild} from 'react'

import {HelpCenter, LocaleCode} from '../../../../../models/helpCenter/types'
import {HELP_CENTER_TITLE_MAX_LENGTH} from '../../constants'
import {useLocales} from '../../hooks/useLocales'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'

import ArticleCategorySelect from './ArticleCategorySelect'

import css from './HelpCenterEditModalHeader.less'

type Props = {
    title: string
    helpCenter: HelpCenter
    language: LocaleCode
    isFullscreen?: boolean
    supportedLocales: LocaleCode[]
    articleLocales?: LocaleCode[]
    selectedCategoryId?: number | null
    onEditTitle?: (title: string) => void
    onEditCategory?: (categoryId: number | null) => void
    onChangeLanguage: (localeCode: LocaleCode) => void
    onResize?: () => void
    onClose: () => void
    onClickAction: (action: ActionType, currentOption: OptionItem) => void
    toggleModalBtn?: ReactChild
}

export const HelpCenterEditModalHeader = ({
    title,
    helpCenter,
    isFullscreen,
    language,
    supportedLocales,
    articleLocales,
    onEditTitle,
    onEditCategory,
    onClose,
    onResize,
    onChangeLanguage,
    onClickAction,
    toggleModalBtn,
    selectedCategoryId,
}: Props): JSX.Element => {
    const locales = useLocales()

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

    return (
        <header className={css.header}>
            <div className={css.headerTopContainer}>
                <input
                    type="text"
                    value={title}
                    placeholder="Title"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        onEditTitle?.(event.target.value)
                    }
                    disabled={Boolean(!onEditTitle)}
                    className={css.titleInput}
                    maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                />
                <div className={css.headerControls}>
                    <ArticleLanguageSelect
                        selected={language}
                        list={localeSelectOptions}
                        onSelect={onChangeLanguage}
                        onClickAction={onClickAction}
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
            {onEditCategory && selectedCategoryId !== undefined && (
                <div className={css.categorySelect}>
                    <ArticleCategorySelect
                        locale={language}
                        helpCenterId={helpCenter.id}
                        categoryId={selectedCategoryId}
                        onChange={(value: number | null) => {
                            onEditCategory(value)
                        }}
                    />
                </div>
            )}
        </header>
    )
}

export default HelpCenterEditModalHeader
