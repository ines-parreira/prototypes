import React, {ReactChild, ChangeEvent} from 'react'

import LanguageSelect from '../newView/LanguageSelect'
import {
    HelpCenterLocale,
    HelpCenterLocaleCode,
} from '../../../../../models/helpCenter/types'

import css from './HelpCenterEditModalHeader.less'

type Props = {
    title: string
    language: string
    isFullscreen?: boolean
    languageOptions: HelpCenterLocale[]
    onEditTitle?: (title: string) => void
    onChangeLanguage: (articleLanguage: HelpCenterLocaleCode) => void
    onResize?: () => void
    onClose: () => void
    toggleModalBtn?: ReactChild
}

export const HelpCenterEditModalHeader = ({
    title,
    isFullscreen,
    language,
    languageOptions,
    onEditTitle,
    onClose,
    onResize,
    onChangeLanguage,
    toggleModalBtn,
}: Props) => {
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
                <LanguageSelect
                    value={language}
                    className={css.languageSelect}
                    onChange={onChangeLanguage}
                    options={languageOptions}
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
