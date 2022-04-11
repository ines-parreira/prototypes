import React, {ChangeEvent, ReactChild, useEffect, useMemo, useRef} from 'react'

import {Article, LocaleCode} from 'models/helpCenter/types'
import IconButton from 'pages/common/components/button/IconButton'

import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import {useEditionManager} from '../../providers/EditionManagerContext'
import {useSupportedLocales} from '../../providers/SupportedLocales'
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
    onCopyLinkToClipboard: (article: Article) => void
    toggleModalBtn?: ReactChild
    autoFocus?: boolean
    showCategorySelect?: boolean
    previewUrl?: string
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
    onCopyLinkToClipboard,
    toggleModalBtn,
    helpCenterId,
    autoFocus = false,
    showCategorySelect = false,
    previewUrl,
}: Props) => {
    const locales = useSupportedLocales()
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
            <IconButton
                onClick={onResize}
                fillStyle="ghost"
                intent="secondary"
                size="small"
                aria-label="halfscreen modal"
            >
                fullscreen_exit
            </IconButton>
        ) : (
            <IconButton
                onClick={onResize}
                fillStyle="ghost"
                intent="secondary"
                size="small"
                aria-label="fullscreen modal"
            >
                fullscreen
            </IconButton>
        )

    const localeOptions = useMemo(
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
                        list={localeOptions}
                        onSelect={onLanguageSelect}
                        onActionClick={onArticleLanguageSelectActionClick}
                    />
                    {onResize && getResizeModalButton()}
                    {previewUrl && (
                        <IconButton
                            onClick={() =>
                                window.open(previewUrl, '_blank')?.focus()
                            }
                            fillStyle="ghost"
                            intent="secondary"
                            size="small"
                            aria-label="preview article"
                        >
                            open_in_new
                        </IconButton>
                    )}
                    {isExistingArticle(selectedArticle) && (
                        <IconButton
                            onClick={() =>
                                onCopyLinkToClipboard(selectedArticle)
                            }
                            fillStyle="ghost"
                            intent="secondary"
                            size="small"
                            aria-label="copy url"
                        >
                            share
                        </IconButton>
                    )}
                    {toggleModalBtn}
                    <IconButton
                        onClick={onClose}
                        fillStyle="ghost"
                        intent="secondary"
                        size="small"
                        aria-label="close edit modal"
                    >
                        keyboard_tab
                    </IconButton>
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
