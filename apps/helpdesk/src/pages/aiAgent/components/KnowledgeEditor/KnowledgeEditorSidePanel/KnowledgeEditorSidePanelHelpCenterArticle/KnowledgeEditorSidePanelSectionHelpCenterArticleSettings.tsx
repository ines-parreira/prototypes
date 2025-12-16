import { Icon, IconSize } from '@gorgias/axiom'

import { useSettingsAutoSave } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'
import ArticleCategorySelectField from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/ArticleCategorySelectField'
import { ArticleLanguageSelect } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import SelectVisibilityStatus from 'pages/settings/helpCenter/components/SelectVisibilityStatus/SelectVisibilityStatus'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'

import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { ExcerptInput } from './components/ExcerptInput'
import { SeoMetaDescription } from './components/SeoMetaDescription'
import { SeoMetaTitle } from './components/SeoMetaTitle'
import { SlugInput } from './components/SlugInput'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings.less'

export type Props = {
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleSettings = ({
    sectionId,
}: Props) => {
    const { settingsProps, autoSave } = useSettingsAutoSave()
    const {
        category,
        excerpt,
        language,
        metaTitle,
        metaDescription,
        title,
        slug,
        visibility,
    } = settingsProps

    const headerTitle = (
        <div className={css.headerWithBadge}>
            <span>Settings</span>
            <AutoSaveBadge
                state={autoSave.state}
                updatedAt={autoSave.updatedAt}
                savedIcon={<Icon name="cloud-check" size={IconSize.Md} />}
                tooltipPlacement="top-start"
            />
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
                            metaDescription?.onChangeMetaDescription ??
                            undefined
                        }
                    />
                </div>
            </div>
        </KnowledgeEditorSidePanelSection>
    )
}
