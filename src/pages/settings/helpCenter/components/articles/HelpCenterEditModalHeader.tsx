import React, {ReactChild, ChangeEvent} from 'react'

import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'

import {
    HelpCenterArticle,
    LocaleCode,
    HelpCenter,
} from '../../../../../models/helpCenter/types'

import {useLocaleSelectOptions} from '../../hooks/useLocaleSelectOptions'
import {useLocales} from '../../hooks/useLocales'

import ArticleCategorySelect from './ArticleCategorySelect'

import css from './HelpCenterEditModalHeader.less'

type Props = {
    title: string
    helpCenter: HelpCenter
    language: LocaleCode
    isFullscreen?: boolean
    supportedLocales: LocaleCode[]
    selectedArticle: HelpCenterArticle
    selectedCategory?: number | null
    onEditTitle?: (title: string) => void
    onEditCategory?: (categoryId: number | null) => void
    onChangeLanguage: (ev: React.MouseEvent, value: LocaleCode) => void
    onResize?: () => void
    onClose: () => void
    onClickAction: (
        ev: React.MouseEvent,
        action: ActionType,
        currentOption: OptionItem
    ) => void
    toggleModalBtn?: ReactChild
}

export const HelpCenterEditModalHeader = ({
    title,
    helpCenter,
    isFullscreen,
    language,
    supportedLocales,
    selectedArticle,
    onEditTitle,
    onEditCategory,
    onClose,
    onResize,
    onChangeLanguage,
    onClickAction,
    toggleModalBtn,
    selectedCategory,
}: Props): JSX.Element => {
    const locales = useLocales()
    const localeOptions = useLocaleSelectOptions(locales, supportedLocales)

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
            localeOptions.map((option) => {
                let isComplete = false
                let canBeDeleted = true

                if (selectedArticle?.available_locales) {
                    isComplete = selectedArticle.available_locales.includes(
                        option.value
                    )
                    canBeDeleted =
                        selectedArticle?.available_locales?.length > 1
                }

                return {
                    ...option,
                    isComplete,
                    canBeDeleted,
                }
            }),
        [localeOptions, selectedArticle.available_locales]
    )

    return (
        <header className={css.header}>
            <div className={css.headerTopContainer}>
                <input
                    type="text"
                    value={title}
                    placeholder="Title"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        onEditTitle && onEditTitle(event.target.value)
                    }
                    disabled={Boolean(!onEditTitle)}
                    className={css.titleInput}
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
            {onEditCategory && selectedCategory !== undefined && (
                <div className={css.categorySelect}>
                    <ArticleCategorySelect
                        locale={language}
                        helpCenterId={helpCenter.id}
                        categoryId={selectedCategory}
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
