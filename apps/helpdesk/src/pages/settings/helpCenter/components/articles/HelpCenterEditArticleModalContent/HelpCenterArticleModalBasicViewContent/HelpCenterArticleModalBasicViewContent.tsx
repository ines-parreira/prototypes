import type React from 'react'
import { useCallback, useMemo } from 'react'

import { SCREEN_SIZE, useScreenSize } from '@repo/hooks'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import type {
    Article,
    CreateArticleDto,
    LocaleCode,
} from 'models/helpCenter/types'
import { isArticleWithExistingTranslation } from 'models/helpCenter/types'
import {
    EDITOR_MODAL_CONTAINER_ID,
    HELP_CENTER_DEFAULT_LAYOUT,
} from 'pages/settings/helpCenter/constants'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import type { ArticleMode } from 'pages/settings/helpCenter/types/articleMode'
import {
    getHelpCenterDomain,
    isExistingArticle,
    slugify,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { getDetailedFormattedDate, getFormattedDate } from 'utils/date'

import { useAbilityChecker } from '../../../../hooks/useHelpCenterApi'
import type { ActionType, OptionItem } from '../../ArticleLanguageSelect'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
import HelpCenterEditor from '../../HelpCenterEditor/HelpCenterEditor'
import { HelpCenterArticleModalView } from '../types'

import css from '../HelpCenterEditArticleModalContent.less'

type Props = {
    onArticleLanguageSelect: (localeCode: LocaleCode) => void
    autoFocus: boolean

    onArticleModalClose: () => void

    onArticleLanguageSelectActionClick: (
        action: ActionType,
        option: OptionItem,
    ) => void

    onArticleChange: (
        {
            content,
        }: {
            content: string
        },
        counters: any,
    ) => void

    onEditorReady: (content: string) => void

    // should be removed
    counters?: { charCount: number }

    // should be defined inside this component as a local state to manage the CTA states
    // of "Save Changes" | "Create article" | "Publish article"
    // or in a CurrentArticleTranslationEditionContext shared across the Main and Advanced mode
    canSaveArticle: boolean

    requiredFieldsArticle: Partial<
        keyof Components.Schemas.CreateArticleTranslationDto
    >[]

    // should be replaced by a call to a service, & provided by the
    // CurrentArticleTranslationEditionContext (that manages the current
    // article translation being edited)
    articleMode: ArticleMode

    isDraftAllowed?: boolean
    isFullscreenAllowed?: boolean
    isXSLayout?: boolean

    onChangesDiscard: () => void
    onCopyLinkToClipboard: (article: Article, isUnlisted: boolean) => void
    customFooterContent?: React.ReactNode
}

const HelpCenterArticleModalBasicViewContent = ({
    autoFocus,
    onArticleLanguageSelect,
    onArticleModalClose,
    onArticleLanguageSelectActionClick,
    onArticleChange,
    onEditorReady,
    counters,
    canSaveArticle,
    requiredFieldsArticle,
    onChangesDiscard,
    onCopyLinkToClipboard,
    articleMode,
    customFooterContent,
    isDraftAllowed = true,
    isFullscreenAllowed = true,
    isXSLayout = false,
}: Props) => {
    const screenSize = useScreenSize()
    const { isPassingRulesCheck } = useAbilityChecker()
    const {
        setEditModal,
        selectedArticle,
        setSelectedArticle,
        isFullscreenEditModal,
        setIsFullscreenEditModal,
        setIsEditorCodeViewActive,
    } = useEditionManager()

    const { lastUpdate, lastUpdateDetailed } = useMemo(() => {
        return selectedArticle &&
            isArticleWithExistingTranslation(selectedArticle)
            ? {
                  lastUpdate: getFormattedDate(
                      selectedArticle.translation.updated_datetime,
                  ),
                  lastUpdateDetailed: getDetailedFormattedDate(
                      selectedArticle.translation.updated_datetime,
                  ),
              }
            : {
                  lastUpdate: '',
                  lastUpdateDetailed: '',
              }
    }, [selectedArticle])

    const onArticleContentEdit = useCallback(
        (content: string, charCount?: number) => {
            onArticleChange(
                { ...selectedArticle?.translation, content },
                charCount,
            )
        },
        [selectedArticle?.translation, onArticleChange],
    )

    const helpCenter = useCurrentHelpCenter()
    const hasOnePagerLayout = helpCenter.layout !== HELP_CENTER_DEFAULT_LAYOUT

    if (!selectedArticle?.translation || !helpCenter) {
        return null
    }

    const articleId =
        'article_id' in selectedArticle.translation
            ? selectedArticle.translation.article_id
            : undefined
    const helpCenterDomain = getHelpCenterDomain(helpCenter)

    const canUpdateArticle = isPassingRulesCheck(({ can }) =>
        can('update', 'ArticleEntity'),
    )

    return (
        <span className={css.modalForm} id={EDITOR_MODAL_CONTAINER_ID}>
            <HelpCenterEditModalHeader
                articleMode={articleMode}
                showInlineLanguageSelect
                showCategorySelect
                showVisibilitySelect
                title={selectedArticle.translation.title}
                lastUpdate={lastUpdate}
                lastUpdateDetailed={lastUpdateDetailed}
                isFullscreen={isFullscreenEditModal}
                supportedLocales={helpCenter.supported_locales}
                onLanguageSelect={onArticleLanguageSelect}
                onClose={onArticleModalClose}
                onResize={
                    isFullscreenAllowed && screenSize !== SCREEN_SIZE.SMALL
                        ? () => setIsFullscreenEditModal(!isFullscreenEditModal)
                        : undefined
                }
                onTitleChange={(title: string) =>
                    setSelectedArticle(
                        (prevSelectedArticle) =>
                            ((prevSelectedArticle?.translation && {
                                ...prevSelectedArticle,
                                translation: {
                                    ...prevSelectedArticle.translation,
                                    title,
                                    slug: slugify(title),
                                },
                            }) ||
                                null) as Article | CreateArticleDto | null,
                    )
                }
                customerVisibility={
                    selectedArticle.translation.customer_visibility
                }
                onArticleLanguageSelectActionClick={
                    onArticleLanguageSelectActionClick
                }
                onCopyLinkToClipboard={onCopyLinkToClipboard}
                toggleModalBtn={
                    <Tooltip>
                        <Button
                            onClick={() =>
                                setEditModal({
                                    isOpened: true,
                                    view: HelpCenterArticleModalView.ADVANCED,
                                })
                            }
                            isDisabled={!canUpdateArticle}
                            variant="tertiary"
                            size="md"
                            icon="settings"
                            aria-label="advanced editor modal"
                        />
                        <TooltipContent title="View settings" />
                    </Tooltip>
                }
                autoFocus={autoFocus}
                domain={helpCenterDomain}
                helpCenterHasDefaultLayout={!hasOnePagerLayout}
            />
            <HelpCenterEditor
                articleId={articleId}
                locale={selectedArticle.translation.locale}
                value={selectedArticle.translation.content}
                onChange={onArticleContentEdit}
                onEditorReady={onEditorReady}
                useXSLayout={isXSLayout}
                setIsEditorCodeViewActive={setIsEditorCodeViewActive}
            />
            <HelpCenterEditModalFooter
                rating={
                    isExistingArticle(selectedArticle)
                        ? selectedArticle.translation.rating
                        : undefined
                }
                counters={counters}
                canSave={canSaveArticle}
                isDraftAllowed={isDraftAllowed}
                requiredFields={requiredFieldsArticle}
                articleMode={articleMode}
                onDiscard={onChangesDiscard}
                hasOnePagerLayout={hasOnePagerLayout}
                customContent={customFooterContent}
            />
        </span>
    )
}

export default HelpCenterArticleModalBasicViewContent
