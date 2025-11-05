import { Icon, IconSize } from '@gorgias/axiom'

import { LocaleCode, VisibilityStatus } from 'models/helpCenter/types'
import { Option } from 'pages/common/forms/SelectField/types'
import ArticleCategorySelectField from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/ArticleCategorySelectField'
import {
    ArticleLanguageSelect,
    ActionType as LocaleActionType,
    OptionItem as LocaleOption,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import SelectVisibilityStatus from 'pages/settings/helpCenter/components/SelectVisibilityStatus/SelectVisibilityStatus'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { ExcerptInput } from './components/ExcerptInput'
import { SeoMetaDescription } from './components/SeoMetaDescription'
import { SeoMetaTitle } from './components/SeoMetaTitle'
import { SlugInput } from './components/SlugInput'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings.less'

export type Props = {
    category: {
        categoryId: number | null
        categoryTitlesById: Record<string, string>
        categoryOptions: Option[]
        onChangeCategory: (value: number | null) => void
    }

    language: {
        locale: LocaleCode
        localeOptions: LocaleOption[]
        onChangeLanguage: (locale: LocaleCode) => void
        onActionClick: (
            action: LocaleActionType,
            currentOption: LocaleOption,
        ) => void
    }

    visibility: {
        visibilityStatus: VisibilityStatus
        onChangeVisibility: (status: VisibilityStatus) => void
        isParentUnlisted: boolean
    }

    slug?: {
        slug: string
        onChangeSlug: (slug: string) => void
        articleId: number
    }

    excerpt?: {
        excerpt: string
        onChangeExcerpt: (excerpt: string) => void
    }

    metaTitle?: {
        metaTitle: string
        onChangeMetaTitle: (metaTitle: string) => void
    }
    metaDescription?: {
        metaDescription: string
        onChangeMetaDescription: (metaDescription: string) => void
    }

    title: string

    autoSave?: {
        state: AutoSaveState
        updatedAt?: Date
    }

    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleSettings = ({
    category,
    excerpt,
    language,
    metaTitle,
    metaDescription,
    title,
    slug,
    visibility,
    autoSave,
    sectionId,
}: Props) => {
    const headerTitle = (
        <div className={css.headerWithBadge}>
            <span>Settings</span>
            {autoSave && (
                <AutoSaveBadge
                    state={autoSave.state}
                    updatedAt={autoSave.updatedAt}
                    savedIcon={<Icon name="cloud-check" size={IconSize.Md} />}
                    tooltipPlacement="top-start"
                />
            )}
        </div>
    )

    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: headerTitle }}
            sectionId={sectionId}
        >
            <div className={css.settings}>
                <div className={css.setting}>
                    <div className={css.label}>Help Center category</div>
                    <div>
                        <ArticleCategorySelectField
                            categoryId={category.categoryId}
                            categoryTitlesById={category.categoryTitlesById}
                            options={category.categoryOptions}
                            onChange={category.onChangeCategory}
                            isDisabled={false}
                        />
                    </div>
                </div>
                <div className={css.setting}>
                    <div className={css.label}>Language</div>
                    <div>
                        <ArticleLanguageSelect
                            selected={language.locale}
                            list={language.localeOptions}
                            onSelect={language.onChangeLanguage}
                            onActionClick={language.onActionClick}
                            className={css.inlineLanguageSelect}
                        />
                    </div>
                </div>
                <div className={css.setting}>
                    <div className={css.label}>Visibility status</div>
                    <div>
                        <SelectVisibilityStatus
                            onChange={visibility.onChangeVisibility}
                            status={visibility.visibilityStatus}
                            showNotification={false}
                            setShowNotification={() => {}}
                            isParentUnlisted={visibility.isParentUnlisted}
                            type="article"
                            className={css.visibilitySelect}
                        />
                    </div>
                </div>

                <div className={css.setting}>
                    {slug && (
                        <SlugInput
                            slug={slug.slug}
                            onChangeSlug={slug.onChangeSlug}
                            articleId={slug.articleId}
                        />
                    )}

                    <SeoMetaTitle
                        title={title}
                        metaTitle={metaTitle?.metaTitle ?? ''}
                        onChangeMetaTitle={
                            metaTitle?.onChangeMetaTitle ?? undefined
                        }
                    />
                    <ExcerptInput
                        excerpt={excerpt?.excerpt ?? ''}
                        onChangeExcerpt={excerpt?.onChangeExcerpt ?? undefined}
                    />

                    <SeoMetaDescription
                        defaultDescription={excerpt?.excerpt ?? ''}
                        metaDescription={metaDescription?.metaDescription ?? ''}
                        onChangeMetaDescription={
                            metaTitle?.onChangeMetaTitle ?? undefined
                        }
                    />
                </div>
            </div>
        </KnowledgeEditorSidePanelSection>
    )
}
