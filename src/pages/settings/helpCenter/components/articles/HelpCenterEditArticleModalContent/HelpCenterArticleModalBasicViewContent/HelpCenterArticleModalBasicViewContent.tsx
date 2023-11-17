import React, {useCallback, useMemo, useState} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    Article,
    isArticleWithExistingTranslation,
    LocaleCode,
} from 'models/helpCenter/types'
import {Components} from 'rest_api/help_center_api/client.generated'
import {SCREEN_SIZE, useScreenSize} from 'hooks/useScreenSize'

import {EDITOR_MODAL_CONTAINER_ID} from 'pages/settings/helpCenter/constants'
import {
    getHelpCenterDomain,
    isExistingArticle,
    slugify,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {ArticleMode} from 'pages/settings/helpCenter/types/articleMode'
import IconButton from 'pages/common/components/button/IconButton'
import {getDetailedFormattedDate, getFormattedDate} from 'utils/date'
import Tooltip from 'pages/common/components/Tooltip'
import Alert from 'pages/common/components/Alert/Alert'
import {FeatureFlagKey} from 'config/featureFlags'
import {containsAttachmentURL} from 'pages/settings/helpCenter/utils/containsAttachmentUrl'
import {ActionType, OptionItem} from '../../ArticleLanguageSelect'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
import HelpCenterEditor from '../../HelpCenterEditor/HelpCenterEditor'
import {HelpCenterArticleModalView} from '../types'

import css from '../HelpCenterEditArticleModalContent.less'
import {useAbilityChecker} from '../../../../hooks/useHelpCenterApi'

type Props = {
    onArticleLanguageSelect: (localeCode: LocaleCode) => void
    autoFocus: boolean

    onArticleModalClose: () => void

    onArticleLanguageSelectActionClick: (
        action: ActionType,
        option: OptionItem
    ) => void

    onArticleChange: (
        {
            content,
        }: {
            content: string
        },
        counters: any
    ) => void

    onEditorReady: (content: string) => void

    // should be removed
    counters?: {charCount: number}

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

    onChangesDiscard: () => void
    onCopyLinkToClipboard: (article: Article, isUnlisted: boolean) => void
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
}: Props) => {
    const screenSize = useScreenSize()
    const {isPassingRulesCheck} = useAbilityChecker()
    const {
        setEditModal,
        selectedArticle,
        setSelectedArticle,
        isFullscreenEditModal,
        setIsFullscreenEditModal,
    } = useEditionManager()
    const attachmentDisclaimerEnabled: boolean =
        useFlags()[FeatureFlagKey.AutomateShowAttachmentUploadDisclaimer]

    const [containsAttachment, setContainsAttachment] = useState(
        () =>
            selectedArticle !== null &&
            containsAttachmentURL(selectedArticle.translation.content)
    )

    const [attachmentDisclaimerClosed, setAttachmentDisclaimerClosed] =
        useState(false)

    const showAttachmentDisclaimer = useMemo(
        () =>
            attachmentDisclaimerEnabled &&
            !attachmentDisclaimerClosed &&
            containsAttachment,
        [
            attachmentDisclaimerEnabled,
            attachmentDisclaimerClosed,
            containsAttachment,
        ]
    )

    const {lastUpdate, lastUpdateDetailed} = useMemo(() => {
        return selectedArticle &&
            isArticleWithExistingTranslation(selectedArticle)
            ? {
                  lastUpdate: getFormattedDate(
                      selectedArticle.translation.updated_datetime
                  ),
                  lastUpdateDetailed: getDetailedFormattedDate(
                      selectedArticle.translation.updated_datetime
                  ),
              }
            : {
                  lastUpdate: '',
                  lastUpdateDetailed: '',
              }
    }, [selectedArticle])

    const onArticleContentEdit = useCallback(
        (content: string, charCount?: number) => {
            if (attachmentDisclaimerEnabled && !attachmentDisclaimerClosed) {
                setContainsAttachment(containsAttachmentURL(content))
            }
            onArticleChange(
                {...selectedArticle?.translation, content},
                charCount
            )
        },
        [
            selectedArticle?.translation,
            onArticleChange,
            attachmentDisclaimerClosed,
            attachmentDisclaimerEnabled,
        ]
    )

    const helpCenter = useCurrentHelpCenter()

    if (!selectedArticle?.translation || !helpCenter) {
        return null
    }

    const articleId =
        'article_id' in selectedArticle.translation
            ? selectedArticle.translation.article_id
            : undefined
    const helpCenterDomain = getHelpCenterDomain(helpCenter)

    const canUpdateArticle = isPassingRulesCheck(({can}) =>
        can('update', 'ArticleEntity')
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
                    screenSize !== SCREEN_SIZE.SMALL
                        ? () => setIsFullscreenEditModal(!isFullscreenEditModal)
                        : undefined
                }
                onTitleChange={(title: string) =>
                    setSelectedArticle(
                        (prevSelectedArticle) =>
                            (prevSelectedArticle?.translation && {
                                ...prevSelectedArticle,
                                translation: {
                                    ...prevSelectedArticle.translation,
                                    title,
                                    slug: slugify(title),
                                },
                            }) ||
                            null
                    )
                }
                visibilityStatus={selectedArticle.translation.visibility_status}
                onArticleLanguageSelectActionClick={
                    onArticleLanguageSelectActionClick
                }
                onCopyLinkToClipboard={onCopyLinkToClipboard}
                toggleModalBtn={
                    <>
                        <Tooltip
                            placement="bottom-end"
                            target="settings-button"
                        >
                            Open settings
                        </Tooltip>
                        <IconButton
                            onClick={() =>
                                setEditModal({
                                    isOpened: true,
                                    view: HelpCenterArticleModalView.ADVANCED,
                                })
                            }
                            isDisabled={!canUpdateArticle}
                            fillStyle="ghost"
                            intent="secondary"
                            id="settings-button"
                            size="medium"
                            aria-label="advanced editor modal"
                        >
                            settings
                        </IconButton>
                    </>
                }
                autoFocus={autoFocus}
                domain={helpCenterDomain}
            />
            <HelpCenterEditor
                articleId={articleId}
                locale={selectedArticle.translation.locale}
                value={selectedArticle.translation.content}
                onChange={onArticleContentEdit}
                onEditorReady={onEditorReady}
            />
            {showAttachmentDisclaimer && (
                <div className={css.attachmentDisclaimerContainer}>
                    <Alert
                        icon
                        onClose={() => setAttachmentDisclaimerClosed(true)}
                        className={css.attachmentDisclaimer}
                    >
                        Make sure you're not uploading files containing
                        sensitive information.
                    </Alert>
                </div>
            )}
            <HelpCenterEditModalFooter
                rating={
                    isExistingArticle(selectedArticle)
                        ? selectedArticle.translation.rating
                        : undefined
                }
                counters={counters}
                canSave={canSaveArticle}
                requiredFields={requiredFieldsArticle}
                articleMode={articleMode}
                onDiscard={onChangesDiscard}
            />
        </span>
    )
}

export default HelpCenterArticleModalBasicViewContent
