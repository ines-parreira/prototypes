import React, {
    ChangeEvent,
    ReactChild,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { Article, LocaleCode, VisibilityStatus } from 'models/helpCenter/types'
import IconButton from 'pages/common/components/button/IconButton'
import { getCategories } from 'state/entities/helpCenter/categories'

import {
    DRAWER_TRANSITION_DURATION_MS,
    EditingStateEnum,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import { useAbilityChecker } from '../../hooks/useHelpCenterApi'
import { useEditionManager } from '../../providers/EditionManagerContext'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import { ArticleMode } from '../../types/articleMode'
import {
    getArticleUrl,
    getHomePageItemHashUrl,
    isExistingArticle,
} from '../../utils/helpCenter.utils'
import { getLocaleSelectOptions } from '../../utils/localeSelectOptions'
import EditingState from '../EditingState/EditingState'
import { isOneOfParentsUnlisted } from '../HelpCenterCategoryEdit/utils'
import SelectVisibilityStatus from '../SelectVisibilityStatus/SelectVisibilityStatus'
import ArticleCategorySelect from './ArticleCategorySelect'
import {
    ActionType,
    ArticleLanguageSelect,
    OptionItem,
} from './ArticleLanguageSelect'

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
        currentOption: OptionItem,
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
    helpCenterHasDefaultLayout: boolean
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
    helpCenterHasDefaultLayout,
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

    const getResizeModalButton = () => (
        <>
            <Tooltip placement="bottom" target="fullscreen-button">
                {isFullscreen ? 'Halfscreen mode' : 'Fullscreen mode'}
            </Tooltip>
            <div id="fullscreen-button">
                {isFullscreen ? (
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
                )}
            </div>
        </>
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
        [locales, supportedLocales, articleLocales],
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

    const publishedPreviewUrl = useMemo(() => {
        if (
            editingState === EditingStateEnum.PUBLISHED &&
            isExistingArticle(selectedArticle)
        ) {
            const locale = selectedArticle.translation.locale
            const slug = selectedArticle.translation.slug
            const articleId = selectedArticle.id
            const unlistedId = selectedArticle.translation.article_unlisted_id
            return helpCenterHasDefaultLayout
                ? getArticleUrl({
                      domain,
                      locale,
                      slug,
                      articleId,
                      unlistedId,
                      isUnlisted,
                  })
                : getHomePageItemHashUrl({
                      itemType: 'article',
                      domain,
                      locale,
                      itemId: articleId,
                      isUnlisted,
                  })
        }
        return undefined
    }, [
        domain,
        editingState,
        helpCenterHasDefaultLayout,
        isUnlisted,
        selectedArticle,
    ])

    const { isPassingRulesCheck } = useAbilityChecker()

    useEffect(() => {
        setIsParentUnlisted(
            isOneOfParentsUnlisted(categories, selectedCategoryId),
        )
    }, [selectedCategoryId, categories])

    useEffect(() => {
        if (autoFocus) {
            // Only set the auto-focus after the drawer animation is finished,
            // otherwise it breaks the animation
            setTimeout(
                () => titleInputRef.current?.focus(),
                DRAWER_TRANSITION_DURATION_MS,
            )
        }
    }, [autoFocus])

    const canUpdateArticle = isPassingRulesCheck(({ can }) =>
        can('update', 'ArticleEntity'),
    )

    const showPreviewArticleButton =
        publishedPreviewUrl && (helpCenterHasDefaultLayout || !isUnlisted)

    const showCopyURLButton = helpCenterHasDefaultLayout
        ? isExistingArticle(selectedArticle)
        : publishedPreviewUrl && !isUnlisted

    const handleCopyURL = () => {
        if (isExistingArticle(selectedArticle)) {
            onCopyLinkToClipboard(selectedArticle, isUnlisted)
        }
    }

    return (
        <header className={css.header}>
            <div className={css.headerTopContainer}>
                {onTitleChange ? (
                    <div className={css.titleContainer}>
                        <input
                            title={title}
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
                                    innerProps={{
                                        popperClassName: css.tooltip,
                                        innerClassName: css['tooltip-inner'],
                                    }}
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
                    {showPreviewArticleButton && (
                        <>
                            <Tooltip placement="bottom" target="preview-button">
                                Open article
                            </Tooltip>
                            <IconButton
                                onClick={() =>
                                    window
                                        .open(publishedPreviewUrl, '_blank')
                                        ?.focus()
                                }
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                id="preview-button"
                                aria-label="preview article"
                            >
                                open_in_new
                            </IconButton>
                        </>
                    )}
                    {showCopyURLButton && (
                        <>
                            <Tooltip
                                placement="bottom"
                                target="copy-url-button"
                            >
                                Copy article URL
                            </Tooltip>
                            <IconButton
                                id="copy-url-button"
                                onClick={handleCopyURL}
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                aria-label="copy url"
                            >
                                link
                            </IconButton>
                        </>
                    )}
                    {toggleModalBtn}
                    <Tooltip placement="bottom" target="close-edit-mode-button">
                        Close
                    </Tooltip>
                    <IconButton
                        onClick={onClose}
                        fillStyle="ghost"
                        id="close-edit-mode-button"
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
                                        : null,
                                )
                                setSelectedCategoryId(value)
                                if (value) {
                                    setShowNotification(
                                        isOneOfParentsUnlisted(
                                            categories,
                                            value,
                                        ),
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
                                        : null,
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
