import React, {useCallback} from 'react'

import {LocaleCode} from 'models/helpCenter/types'
import {Components} from 'rest_api/help_center_api/client.generated'
import {
    SCREEN_SIZE,
    useScreenSize,
} from '../../../../../../../hooks/useScreenSize'

import {EDITOR_MODAL_CONTAINER_ID} from '../../../../constants'
import {
    getArticleUrl,
    getHelpCenterDomain,
    isExistingArticle,
    slugify,
} from '../../../../utils/helpCenter.utils'
import {useCurrentHelpCenter} from '../../../../providers/CurrentHelpCenter'
import {useEditionManager} from '../../../../providers/EditionManagerContext'
import {ActionType, OptionItem} from '../../ArticleLanguageSelect'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
import HelpCenterEditor from '../../HelpCenterEditor/HelpCenterEditor'
import {HelpCenterArticleModalView} from '../types'

import css from '../HelpCenterEditArticleModalContent.less'

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
    onArticleSave: () => Promise<void>
    // same
    onArticleDelete: () => Promise<void>

    onChangesDiscard: () => void
}

const HelpCenterArticleModalBasicViewContent = ({
    autoFocus,
    onArticleLanguageSelect,
    onArticleModalClose,
    onArticleLanguageSelectActionClick,
    onArticleChange,
    counters,
    canSaveArticle,
    requiredFieldsArticle,
    onArticleSave,
    onArticleDelete,
    onChangesDiscard,
}: Props) => {
    const screenSize = useScreenSize()
    const {
        setEditModal,
        selectedArticle,
        setSelectedArticle,
        isFullscreenEditModal,
        setIsFullscreenEditModal,
    } = useEditionManager()

    const onArticleContentEdit = useCallback(
        (content: string, charCount?: number) => {
            onArticleChange(
                {...selectedArticle?.translation, content},
                charCount
            )
        },
        [selectedArticle?.translation, onArticleChange]
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
    const selectedArticleUrl =
        isExistingArticle(selectedArticle) && articleId
            ? getArticleUrl({
                  domain: helpCenterDomain,
                  locale: selectedArticle.translation.locale,
                  slug: selectedArticle.translation.slug,
                  articleId,
              })
            : undefined

    return (
        <span className={css.modalForm} id={EDITOR_MODAL_CONTAINER_ID}>
            <HelpCenterEditModalHeader
                showCategorySelect={true}
                helpCenterId={helpCenter.id}
                title={selectedArticle.translation.title}
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
                autoFocus={autoFocus}
                previewUrl={selectedArticleUrl}
            />
            <HelpCenterEditor
                articleId={articleId}
                locale={selectedArticle.translation.locale}
                value={selectedArticle.translation.content}
                onChange={onArticleContentEdit}
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
                canDelete={isExistingArticle(selectedArticle)}
                onSave={onArticleSave}
                onDelete={onArticleDelete}
                onDiscard={onChangesDiscard}
            />
        </span>
    )
}

export default HelpCenterArticleModalBasicViewContent
