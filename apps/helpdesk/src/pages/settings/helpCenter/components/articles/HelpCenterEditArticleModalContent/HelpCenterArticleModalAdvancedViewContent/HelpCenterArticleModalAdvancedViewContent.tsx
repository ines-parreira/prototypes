import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import type {
    Article,
    CreateArticleDto,
    CreateArticleTranslationDto,
    LocalArticleTranslation,
    LocaleCode,
} from 'models/helpCenter/types'
import { HELP_CENTER_DEFAULT_LAYOUT } from 'pages/settings/helpCenter/constants'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import type { ArticleMode } from 'pages/settings/helpCenter/types/articleMode'
import {
    getHelpCenterDomain,
    isExistingArticle,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import type { Components } from 'rest_api/help_center_api/client.generated'

import type { ActionType, OptionItem } from '../../ArticleLanguageSelect'
import HelpCenterEditAdvancedArticleForm from '../../HelpCenterEditAdvancedArticleForm'
import HelpCenterEditModalFooter from '../../HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from '../../HelpCenterEditModalHeader'
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

    onChangesDiscard: () => void
    onCopyLinkToClipboard: (article: Article, isUnlisted: boolean) => void
    customFooterContent?: React.ReactNode
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
    customFooterContent,
    isDraftAllowed = true,
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
                    <Tooltip>
                        <Button
                            onClick={() =>
                                setEditModal({
                                    isOpened: true,
                                    view: HelpCenterArticleModalView.BASIC,
                                })
                            }
                            variant="tertiary"
                            size="md"
                            icon="edit-pencil"
                            aria-label="basic editor modal"
                        />
                        <TooltipContent title="View editor" />
                    </Tooltip>
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
                shopName={helpCenter.shop_name}
                onCategoryChange={setSelectedCategoryId}
                onChange={(
                    translation:
                        | CreateArticleTranslationDto
                        | LocalArticleTranslation,
                ) =>
                    setSelectedArticle((prevSelectedArticle) =>
                        prevSelectedArticle
                            ? ({
                                  ...prevSelectedArticle,
                                  translation,
                              } as Article | CreateArticleDto)
                            : prevSelectedArticle,
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
                isDraftAllowed={isDraftAllowed}
                requiredFields={requiredFieldsArticle}
                onDiscard={onChangesDiscard}
                articleMode={articleMode}
                customContent={customFooterContent}
            />
        </span>
    )
}

export default HelpCenterArticleModalAdvancedViewContent
