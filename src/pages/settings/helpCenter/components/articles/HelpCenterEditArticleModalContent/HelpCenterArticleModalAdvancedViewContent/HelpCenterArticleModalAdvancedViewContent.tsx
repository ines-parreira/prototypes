import React from 'react'

import {
    Article,
    CreateArticleDto,
    CreateArticleTranslationDto,
    HelpCenter,
    LocaleCode,
} from '../../../../../../../models/helpCenter/types'
import {Components} from '../../../../../../../rest_api/help_center_api/client.generated'
import {isExistingArticle} from '../../../../utils/helpCenter.utils'
import {ActionType, OptionItem} from '../../ArticleLanguageSelect'
import HelpCenterEditAdvancedArticleForm from '../../HelpCenterEditAdvancedArticleForm'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
import css from '../HelpCenterEditArticleModalContent.less'
import {HelpCenterArticleModalView, HelpCenterArticleModalState} from '../types'

type Props = {
    selectedArticle: CreateArticleDto | Article
    helpCenter: HelpCenter
    onArticleLanguageSelect: (localeCode: LocaleCode) => void
    articleLocales?: LocaleCode[]
    autoFocus: boolean

    onArticleModalClose: () => void

    // should be set is redux ui
    selectedArticleLanguage: LocaleCode
    setSelectedArticle: React.Dispatch<
        React.SetStateAction<
            Components.Schemas.CreateArticleDto | Article | null
        >
    >

    onArticleLanguageSelectActionClick: (
        action: ActionType,
        option: OptionItem
    ) => void

    // should be set in redux ui state
    setEditModal: React.Dispatch<
        React.SetStateAction<HelpCenterArticleModalState>
    >

    // should be removed
    counters?: {charCount: number}

    // should be defined inside this component as a local state to manage the CTA states
    // of "Save Changes" | "Create article" | "Publish article"
    // or in a CurrentArticleTranslationEditionContext shared across the Main and Advanced mode
    canSaveArticle: boolean

    // ???
    requiredFieldsArticle: Partial<
        keyof Components.Schemas.CreateArticleTranslationDto
    >[]

    // should be replaced by a call to a service, & provided by the
    // CurrentArticleTranslationEditionContext (that manages the current
    // article translation being edited)
    onArticleSave: () => Promise<void>
    // same
    onArticleDelete: () => Promise<void>

    onChangesDiscard: () => void

    helpCenterDomain: string
}

const HelpCenterArticleModalAdvancedViewContent = ({
    selectedArticle,
    helpCenter,
    articleLocales,
    autoFocus,
    onArticleLanguageSelect,
    onArticleModalClose,
    selectedArticleLanguage,
    setSelectedArticle,
    onArticleLanguageSelectActionClick,
    setEditModal,
    helpCenterDomain,
    counters,
    canSaveArticle,
    requiredFieldsArticle,
    onArticleSave,
    onArticleDelete,
    onChangesDiscard,
}: Props) => {
    return (
        <span className={css.modalForm}>
            <HelpCenterEditModalHeader
                helpCenter={helpCenter}
                language={selectedArticleLanguage}
                articleLocales={articleLocales}
                supportedLocales={helpCenter.supported_locales}
                onLanguageSelect={onArticleLanguageSelect}
                title="Article Settings"
                onClose={onArticleModalClose}
                toggleModalBtn={
                    <button
                        type="button"
                        onClick={() =>
                            setEditModal({
                                isOpened: true,
                                view: HelpCenterArticleModalView.BASIC,
                            })
                        }
                        className={css.toggleModalBtn}
                    >
                        <i className="material-icons">edit</i>
                    </button>
                }
                onArticleLanguageSelectActionClick={
                    onArticleLanguageSelectActionClick
                }
                autoFocus={autoFocus}
            />
            <HelpCenterEditAdvancedArticleForm
                articleId={
                    isExistingArticle(selectedArticle)
                        ? selectedArticle.id
                        : undefined
                }
                translation={selectedArticle.translation}
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
                counters={counters}
                canSave={canSaveArticle}
                requiredFields={requiredFieldsArticle}
                canDelete={isExistingArticle(selectedArticle)}
                onSave={onArticleSave}
                onDelete={onArticleDelete}
                onDiscard={onChangesDiscard}
            />
        </span>
    )
}

export default React.memo(HelpCenterArticleModalAdvancedViewContent)
