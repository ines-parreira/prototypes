import type { ChangeEvent, ReactChild } from 'react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type {
    Article,
    CreateArticleDto,
    CustomerVisibility,
    LocaleCode,
} from 'models/helpCenter/types'
import { getCategories } from 'state/entities/helpCenter/categories'

import {
    DRAWER_TRANSITION_DURATION_MS,
    EditingStateEnum,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from '../../constants'
import { useAbilityChecker } from '../../hooks/useHelpCenterApi'
import { useEditionManager } from '../../providers/EditionManagerContext'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import type { ArticleMode } from '../../types/articleMode'
import {
    getArticleUrl,
    getHomePageItemHashUrl,
    isExistingArticle,
} from '../../utils/helpCenter.utils'
import { getLocaleSelectOptions } from '../../utils/localeSelectOptions'
import EditingState from '../EditingState/EditingState'
import { isOneOfParentsUnlisted } from '../HelpCenterCategoryEdit/utils'
import SelectCustomerVisibility from '../SelectVisibilityStatus/SelectVisibilityStatus'
import ArticleCategorySelect from './ArticleCategorySelect'
import type { ActionType, OptionItem } from './ArticleLanguageSelect'
import { ArticleLanguageSelect } from './ArticleLanguageSelect'

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
    customerVisibility?: CustomerVisibility
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
    customerVisibility = 'PUBLIC',
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
            selectedArticle?.translation.customer_visibility === 'UNLISTED'
        )
    }, [isParentUnlisted, selectedArticle?.translation.customer_visibility])

    const getResizeModalButton = () => (
        <Tooltip>
            <Button
                onClick={onResize}
                variant="tertiary"
                size="md"
                icon={isFullscreen ? 'arrow-collapse' : 'arrow-expand'}
                aria-label={
                    isFullscreen ? 'halfscreen modal' : 'fullscreen modal'
                }
            />
            <TooltipContent
                title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            />
        </Tooltip>
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
                            <div className={css.lastUpdateTime}>
                                Last updated on{' '}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span>{lastUpdate}</span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        caption={lastUpdateDetailed}
                                    />
                                </Tooltip>
                            </div>
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
                            className={css.headerLanguageSelect}
                        />
                    )}
                    {onResize && getResizeModalButton()}
                    {showPreviewArticleButton && (
                        <Tooltip>
                            <Button
                                onClick={() =>
                                    window
                                        .open(publishedPreviewUrl, '_blank')
                                        ?.focus()
                                }
                                variant="tertiary"
                                size="md"
                                icon="external-link"
                                aria-label="preview article"
                            />
                            <TooltipContent title="Open article" />
                        </Tooltip>
                    )}
                    {showCopyURLButton && (
                        <Tooltip>
                            <Button
                                onClick={handleCopyURL}
                                variant="tertiary"
                                size="md"
                                icon="link-horizontal"
                                aria-label="copy url"
                            />
                            <TooltipContent title="Copy article URL" />
                        </Tooltip>
                    )}
                    {toggleModalBtn}
                    <Tooltip>
                        <Button
                            onClick={onClose}
                            variant="tertiary"
                            size="md"
                            icon="exit"
                            aria-label="close edit modal"
                        />
                        <TooltipContent title="Close" />
                    </Tooltip>
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
                                setSelectedArticle(
                                    (prevSelectedArticle) =>
                                        (prevSelectedArticle?.translation
                                            ? {
                                                  ...prevSelectedArticle,
                                                  translation: {
                                                      ...prevSelectedArticle.translation,
                                                      category_id: value,
                                                  },
                                              }
                                            : null) as
                                            | Article
                                            | CreateArticleDto
                                            | null,
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
                        <SelectCustomerVisibility
                            onChange={(status) => {
                                setSelectedArticle(
                                    (prevSelectedArticle) =>
                                        (prevSelectedArticle?.translation
                                            ? {
                                                  ...prevSelectedArticle,
                                                  translation: {
                                                      ...prevSelectedArticle.translation,
                                                      customer_visibility:
                                                          status,
                                                  },
                                              }
                                            : null) as
                                            | Article
                                            | CreateArticleDto
                                            | null,
                                )
                            }}
                            status={customerVisibility}
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
                            label="Language"
                        />
                    </div>
                )}
            </div>
        </header>
    )
}

export default HelpCenterEditModalHeader
