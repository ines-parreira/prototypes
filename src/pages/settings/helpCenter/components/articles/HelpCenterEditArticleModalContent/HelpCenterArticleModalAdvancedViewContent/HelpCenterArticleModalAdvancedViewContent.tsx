import {Tooltip} from '@gorgias/ui-kit'
import React from 'react'

import {
    Article,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import IconButton from 'pages/common/components/button/IconButton'
import {HELP_CENTER_DEFAULT_LAYOUT} from 'pages/settings/helpCenter/constants'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {ArticleMode} from 'pages/settings/helpCenter/types/articleMode'
import {
    getHelpCenterDomain,
    isExistingArticle,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {Components} from 'rest_api/help_center_api/client.generated'

import {ActionType, OptionItem} from '../../ArticleLanguageSelect'
import HelpCenterEditAdvancedArticleForm from '../../HelpCenterEditAdvancedArticleForm'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
import css from '../HelpCenterEditArticleModalContent.less'
import {HelpCenterArticleModalView} from '../types'

type Props = {
    onArticleLanguageSelect: (localeCode: LocaleCode) => void
    autoFocus: boolean

    onArticleModalClose: () => void

    onArticleLanguageSelectActionClick: (
        action: ActionType,
        option: OptionItem
    ) => void

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

const HelpCenterArticleModalAdvancedViewContent = ({
    autoFocus,
    onArticleLanguageSelect,
    onArticleModalClose,
    onArticleLanguageSelectActionClick,
    counters,
    canSaveArticle,
    requiredFieldsArticle,
    onChangesDiscard,
    onCopyLinkToClipboard,
    articleMode,
}: Props) => {
    const {
        setEditModal,
        selectedArticle,
        setSelectedArticle,
        selectedCategoryId,
        setSelectedCategoryId,
    } = useEditionManager()

    const helpCenter = useCurrentHelpCenter()
    const hasDefaultLayout = helpCenter.layout === HELP_CENTER_DEFAULT_LAYOUT

    if (!selectedArticle?.translation || !helpCenter) {
        return null
    }

    const helpCenterDomain = getHelpCenterDomain(helpCenter)

    return (
        <span className={css.modalForm}>
            <HelpCenterEditModalHeader
                articleMode={articleMode}
                supportedLocales={helpCenter.supported_locales}
                onLanguageSelect={onArticleLanguageSelect}
                title="Article Settings"
                onClose={onArticleModalClose}
                toggleModalBtn={
                    <>
                        <Tooltip
                            placement="bottom-end"
                            target="back-edit-button"
                        >
                            Open editor
                        </Tooltip>
                        <IconButton
                            onClick={() =>
                                setEditModal({
                                    isOpened: true,
                                    view: HelpCenterArticleModalView.BASIC,
                                })
                            }
                            id="back-edit-button"
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="basic editor modal"
                        >
                            edit
                        </IconButton>
                    </>
                }
                onArticleLanguageSelectActionClick={
                    onArticleLanguageSelectActionClick
                }
                onCopyLinkToClipboard={onCopyLinkToClipboard}
                autoFocus={autoFocus}
                domain={helpCenterDomain}
                helpCenterHasDefaultLayout={hasDefaultLayout}
            />
            <HelpCenterEditAdvancedArticleForm
                articleId={
                    isExistingArticle(selectedArticle)
                        ? selectedArticle.id
                        : undefined
                }
                categoryId={selectedCategoryId}
                translation={selectedArticle.translation}
                onCategoryChange={setSelectedCategoryId}
                onChange={(translation: CreateArticleTranslationDto) =>
                    setSelectedArticle((prevSelectedArticle) =>
                        prevSelectedArticle
                            ? {
                                  ...prevSelectedArticle,
                                  translation,
                              }
                            : prevSelectedArticle
                    )
                }
                domain={helpCenterDomain}
            />
            <HelpCenterEditModalFooter
                rating={
                    isExistingArticle(selectedArticle)
                        ? selectedArticle.translation.rating
                        : undefined
                }
                counters={counters}
                canSave={canSaveArticle}
                requiredFields={requiredFieldsArticle}
                onDiscard={onChangesDiscard}
                articleMode={articleMode}
            />
        </span>
    )
}

export default HelpCenterArticleModalAdvancedViewContent
