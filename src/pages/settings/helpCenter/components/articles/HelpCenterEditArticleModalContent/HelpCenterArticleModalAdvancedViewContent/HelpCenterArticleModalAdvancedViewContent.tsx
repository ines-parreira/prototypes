import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import {
    Article,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import {Components} from 'rest_api/help_center_api/client.generated'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {
    getArticleUrl,
    getHelpCenterDomain,
    isExistingArticle,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {ArticleMode} from 'pages/settings/helpCenter/types/articleMode'
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
    onCopyLinkToClipboard: (article: Article) => void
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

    if (!selectedArticle?.translation || !helpCenter) {
        return null
    }

    const helpCenterDomain = getHelpCenterDomain(helpCenter)
    const selectedArticleUrl =
        isExistingArticle(selectedArticle) &&
        'article_id' in selectedArticle.translation
            ? getArticleUrl({
                  domain: helpCenterDomain,
                  locale: selectedArticle.translation.locale,
                  slug: selectedArticle.translation.slug,
                  articleId: selectedArticle.translation.article_id,
              })
            : undefined

    return (
        <span className={css.modalForm}>
            <HelpCenterEditModalHeader
                helpCenterId={helpCenter.id}
                supportedLocales={helpCenter.supported_locales}
                onLanguageSelect={onArticleLanguageSelect}
                title="Article Settings"
                onClose={onArticleModalClose}
                toggleModalBtn={
                    <IconButton
                        onClick={() =>
                            setEditModal({
                                isOpened: true,
                                view: HelpCenterArticleModalView.BASIC,
                            })
                        }
                        fillStyle="ghost"
                        intent="secondary"
                        size="small"
                        aria-label="basic editor modal"
                    >
                        edit
                    </IconButton>
                }
                onArticleLanguageSelectActionClick={
                    onArticleLanguageSelectActionClick
                }
                onCopyLinkToClipboard={onCopyLinkToClipboard}
                autoFocus={autoFocus}
                previewUrl={selectedArticleUrl}
            />
            <HelpCenterEditAdvancedArticleForm
                articleId={
                    isExistingArticle(selectedArticle)
                        ? selectedArticle.id
                        : undefined
                }
                categoryId={selectedCategoryId}
                helpCenterId={helpCenter.id}
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
