import React, {
    ChangeEvent,
    ReactChild,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {Article, LocaleCode, VisibilityStatus} from 'models/helpCenter/types'
import IconButton from 'pages/common/components/button/IconButton'
import useAppSelector from 'hooks/useAppSelector'
import {getCategories} from 'state/entities/helpCenter/categories'
import Tooltip from 'pages/common/components/Tooltip'
import EditingState from '../EditingState/EditingState'

import SelectVisibilityStatus from '../SelectVisibilityStatus/SelectVisibilityStatus'
import {
    DRAWER_TRANSITION_DURATION_MS,
    EditingStateEnum,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import {useEditionManager} from '../../providers/EditionManagerContext'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {getArticleUrl, isExistingArticle} from '../../utils/helpCenter.utils'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {ArticleMode} from '../../types/articleMode'
import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from '../articles/ArticleLanguageSelect'
import {isOneOfParentsUnlisted} from '../HelpCenterCategoryEdit/utils'

import {useAbilityChecker} from '../../hooks/useHelpCenterApi'
import ArticleCategorySelect from './ArticleCategorySelect'

import css from './HelpCenterEditModalHeader.less'

export type Props = {
    title: string
    isFullscreen?: boolean
    supportedLocales: LocaleCode[]
    onTitleChange?: (title: string) => void
    onLanguageSelect: (localeCode: LocaleCode) => void
    onResize?: () => void
    onClose: () => void
    onArticleLanguageSelectActionClick: (
        action: ActionType,
        currentOption: OptionItem
    ) => void
    onCopyLinkToClipboard: (article: Article, isUnlisted: boolean) => void
    toggleModalBtn?: ReactChild
    autoFocus?: boolean
    showCategorySelect?: boolean
    showInlineLanguageSelect?: boolean
    showVisibilitySelect?: boolean
    visibilityStatus?: VisibilityStatus
    lastUpdate?: string
    lastUpdateDetailed?: string
    domain: string
    articleMode: ArticleMode
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
    autoFocus = false,
    showCategorySelect = false,
    showInlineLanguageSelect = false,
    showVisibilitySelect = false,
    domain,
    articleMode,
    visibilityStatus = 'PUBLIC',
    lastUpdate,
    lastUpdateDetailed,
}: Props) => {
    const locales = useSupportedLocales()
    const titleInputRef = useRef<HTMLInputElement | null>(null)
    const categories = useAppSelector(getCategories)
    const [showNotification, setShowNotification] = useState(false)
    const [isParentUnlisted, setIsParentUnlisted] = useState(false)

    const {
        selectedCategoryId,
        setSelectedCategoryId,
        selectedArticle,
        setSelectedArticle,
        selectedArticleLanguage,
    } = useEditionManager()

    const articleLocales = isExistingArticle(selectedArticle)
        ? selectedArticle.available_locales
        : undefined

    const isUnlisted = useMemo(() => {
        return (
            isParentUnlisted ||
            selectedArticle?.translation.visibility_status === 'UNLISTED'
        )
    }, [isParentUnlisted, selectedArticle?.translation.visibility_status])

    const previewUrl = isExistingArticle(selectedArticle)
        ? getArticleUrl({
              domain,
              locale: selectedArticle.translation.locale,
              slug: selectedArticle.translation.slug,
              articleId: selectedArticle.id,
              unlistedId: selectedArticle.translation.article_unlisted_id,
              isUnlisted,
          })
        : undefined
    const getResizeModalButton = () =>
        isFullscreen ? (
            <IconButton
                onClick={onResize}
                fillStyle="ghost"
                intent="secondary"
                size="medium"
                aria-label="halfscreen modal"
            >
                fullscreen_exit
            </IconButton>
        ) : (
            <IconButton
                onClick={onResize}
                fillStyle="ghost"
                intent="secondary"
                size="medium"
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

    const editingState = useMemo(() => {
        if (articleMode.mode === 'new' || articleMode.mode === 'modified') {
            return EditingStateEnum.UNSAVED
        }
        if (articleMode.mode === 'unchanged_not_published') {
            return EditingStateEnum.SAVED
        }
        return EditingStateEnum.PUBLISHED
    }, [articleMode.mode])

    const {isPassingRulesCheck} = useAbilityChecker()

    useEffect(() => {
        setIsParentUnlisted(
            isOneOfParentsUnlisted(categories, selectedCategoryId)
        )
    }, [selectedCategoryId, categories])

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

    const canUpdateArticle = isPassingRulesCheck(({can}) =>
        can('update', 'ArticleEntity')
    )

    return (
        <header className={css.header}>
            <div className={css.headerTopContainer}>
                {onTitleChange ? (
                    <div>
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
                            disabled={!canUpdateArticle}
                        />
                        {lastUpdate && (
                            <>
                                <div className={css.lastUpdateTime}>
                                    Last updated on{' '}
                                    <span id="last-update">{lastUpdate}</span>
                                </div>
                                <Tooltip
                                    delay={100}
                                    target={`last-update`}
                                    placement="bottom"
                                    popperClassName={css.tooltip}
                                    innerClassName={css['tooltip-inner']}
                                    arrowClassName={css['tooltip-arrow']}
                                >
                                    {lastUpdateDetailed}
                                </Tooltip>
                            </>
                        )}
                    </div>
                ) : (
                    <span className={css.titleInput}>{title}</span>
                )}
                <div className={css.headerControls}>
                    <EditingState state={editingState} />
                    {!showInlineLanguageSelect && (
                        <ArticleLanguageSelect
                            isDisabled={!canUpdateArticle}
                            selected={selectedArticleLanguage}
                            list={localeOptions}
                            onSelect={onLanguageSelect}
                            onActionClick={onArticleLanguageSelectActionClick}
                        />
                    )}
                    {onResize && getResizeModalButton()}
                    {previewUrl && (
                        <IconButton
                            onClick={() =>
                                window.open(previewUrl, '_blank')?.focus()
                            }
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="preview article"
                        >
                            open_in_new
                        </IconButton>
                    )}
                    {isExistingArticle(selectedArticle) && (
                        <IconButton
                            onClick={() =>
                                onCopyLinkToClipboard(
                                    selectedArticle,
                                    isUnlisted
                                )
                            }
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
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
                        size="medium"
                        aria-label="close edit modal"
                    >
                        keyboard_tab
                    </IconButton>
                </div>
            </div>
            <div className={css.break} />
            <div className={css.inlineSettings}>
                {showCategorySelect && selectedCategoryId !== undefined && (
                    <div className={css.categorySelect}>
                        <ArticleCategorySelect
                            locale={selectedArticleLanguage}
                            categoryId={selectedCategoryId}
                            isDisabled={!canUpdateArticle}
                            onChange={(value: number | null) => {
                                setSelectedArticle((prevSelectedArticle) =>
                                    prevSelectedArticle?.translation
                                        ? {
                                              ...prevSelectedArticle,
                                              translation: {
                                                  ...prevSelectedArticle.translation,
                                                  category_id: value,
                                              },
                                          }
                                        : null
                                )
                                setSelectedCategoryId(value)
                                if (value) {
                                    setShowNotification(
                                        isOneOfParentsUnlisted(
                                            categories,
                                            value
                                        )
                                    )
                                } else {
                                    setShowNotification(false)
                                }
                            }}
                        />
                    </div>
                )}
                {showVisibilitySelect && (
                    <div className={css.visiblitySelect}>
                        <SelectVisibilityStatus
                            onChange={(status) => {
                                setSelectedArticle((prevSelectedArticle) =>
                                    prevSelectedArticle?.translation
                                        ? {
                                              ...prevSelectedArticle,
                                              translation: {
                                                  ...prevSelectedArticle.translation,
                                                  visibility_status: status,
                                              },
                                          }
                                        : null
                                )
                            }}
                            status={visibilityStatus}
                            showNotification={showNotification}
                            setShowNotification={setShowNotification}
                            isParentUnlisted={isParentUnlisted}
                            type="article"
                            isDisabled={!canUpdateArticle}
                        />
                    </div>
                )}
                {showInlineLanguageSelect && (
                    <div className={css.articleLanguageSelect}>
                        <ArticleLanguageSelect
                            isDisabled={!canUpdateArticle}
                            selected={selectedArticleLanguage}
                            list={localeOptions}
                            onSelect={onLanguageSelect}
                            onActionClick={onArticleLanguageSelectActionClick}
                            className={css.inlineLanguageSelect}
                        />
                    </div>
                )}
            </div>
        </header>
    )
}

export default HelpCenterEditModalHeader
