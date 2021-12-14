import React from 'react'

import {SCREEN_SIZE} from '../../../../../../../hooks/useScreenSize'
import {
    Article,
    CreateArticleDto,
    HelpCenter,
    LocaleCode,
} from '../../../../../../../models/helpCenter/types'
import {Components} from '../../../../../../../rest_api/help_center_api/client.generated'
import {EDITOR_MODAL_CONTAINER_ID} from '../../../../constants'
import {isExistingArticle, slugify} from '../../../../utils/helpCenter.utils'
import {ActionType, OptionItem} from '../../ArticleLanguageSelect'
import HelpCenterEditArticleForm from '../../HelpCenterEditArticleForm'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
import css from '../HelpCenterEditArticleModalContent.less'
import {HelpCenterArticleModalView, HelpCenterArticleModalState} from '../types'

type Props = {
    selectedArticle: CreateArticleDto | Article
    helpCenter: HelpCenter
    isFullscreenEditModal: boolean
    onArticleLanguageSelect: (localeCode: LocaleCode) => void
    articleLocales?: LocaleCode[]

    onArticleModalClose: () => void

    // replace by using hook directly instead
    screenSize: SCREEN_SIZE
    // should be set in redux ui
    setIsFullscreenEditModal: React.Dispatch<React.SetStateAction<boolean>>

    // should be set is redux ui
    selectedArticleLanguage: LocaleCode
    setSelectedArticle: React.Dispatch<
        React.SetStateAction<
            Components.Schemas.CreateArticleDto | Article | null
        >
    >

    // should be set in redux ui
    selectedCategoryId: number | null
    // should be a redux action
    setSelectedCategoryId: React.Dispatch<React.SetStateAction<number | null>>

    onArticleLanguageSelectActionClick: (
        action: ActionType,
        option: OptionItem
    ) => void

    // should be set in redux ui state
    setEditModal: React.Dispatch<
        React.SetStateAction<HelpCenterArticleModalState>
    >

    onArticleChange: (
        {
            content,
        }: {
            content: string
        },
        counters: any
    ) => void

    // should be set in redux ui state, dispatched from the editor component
    setIsEditorCodeViewActive: React.Dispatch<React.SetStateAction<boolean>>

    // should be removed
    counters?: {
        charCount: number
        wordCount: number
    }

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
}

const HelpCenterArticleModalBasicViewContent = ({
    selectedArticle,
    helpCenter,
    isFullscreenEditModal,
    articleLocales,
    onArticleLanguageSelect,
    onArticleModalClose,
    screenSize,
    setIsFullscreenEditModal,
    selectedArticleLanguage,
    setSelectedArticle,
    selectedCategoryId,
    setSelectedCategoryId,
    onArticleLanguageSelectActionClick,
    setEditModal,
    onArticleChange,
    setIsEditorCodeViewActive,
    counters,
    canSaveArticle,
    requiredFieldsArticle,
    onArticleSave,
    onArticleDelete,
}: Props) => {
    return (
        <span className={css.modalForm} id={EDITOR_MODAL_CONTAINER_ID}>
            <HelpCenterEditModalHeader
                title={selectedArticle.translation.title}
                helpCenter={helpCenter}
                isFullscreen={isFullscreenEditModal}
                articleLocales={articleLocales}
                supportedLocales={helpCenter.supported_locales}
                onLanguageSelect={onArticleLanguageSelect}
                onClose={onArticleModalClose}
                onResize={
                    screenSize !== SCREEN_SIZE.SMALL
                        ? () => setIsFullscreenEditModal(!isFullscreenEditModal)
                        : undefined
                }
                language={selectedArticleLanguage}
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
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId}
                onArticleLanguageSelectActionClick={
                    onArticleLanguageSelectActionClick
                }
                toggleModalBtn={
                    <button
                        type="button"
                        onClick={() =>
                            setEditModal({
                                isOpened: true,
                                view: HelpCenterArticleModalView.ADVANCED,
                            })
                        }
                        className={css.toggleModalBtn}
                    >
                        <i className="material-icons">settings</i>
                    </button>
                }
            />
            <HelpCenterEditArticleForm
                translation={selectedArticle.translation}
                onChange={onArticleChange}
                onEditorCodeViewToggle={setIsEditorCodeViewActive}
            />
            <HelpCenterEditModalFooter
                counters={counters}
                canSave={canSaveArticle}
                requiredFields={requiredFieldsArticle}
                canDelete={isExistingArticle(selectedArticle)}
                onSave={onArticleSave}
                onDelete={onArticleDelete}
            />
        </span>
    )
}

export default React.memo(HelpCenterArticleModalBasicViewContent)
