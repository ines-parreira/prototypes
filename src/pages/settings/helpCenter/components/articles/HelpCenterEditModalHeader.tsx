import React, {ReactChild, ChangeEvent} from 'react'

import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'
import {
    HelpCenterArticle,
    LocaleCode,
} from '../../../../../models/helpCenter/types'

import {useLocaleSelectOptions} from '../../hooks/useLocaleSelectOptions'
import {useLocales} from '../../hooks/useLocales'

import css from './HelpCenterEditModalHeader.less'

type Props = {
    title: string
    language: LocaleCode
    isFullscreen?: boolean
    supportedLocales: LocaleCode[]
    selectedArticle: HelpCenterArticle
    onEditTitle?: (title: string) => void
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
    isFullscreen,
    language,
    supportedLocales,
    selectedArticle,
    onEditTitle,
    onClose,
    onResize,
    onChangeLanguage,
    onClickAction,
    toggleModalBtn,
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

    const options = React.useMemo(
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
                    list={options}
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
        </header>
    )
}

export default HelpCenterEditModalHeader
