import { Icon, IconSize } from '@gorgias/axiom'

import { useSettingsAutoSave } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'
import ArticleCategorySelect from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/ArticleCategorySelect'
import SelectCustomerVisibility from 'pages/settings/helpCenter/components/SelectVisibilityStatus/SelectVisibilityStatus'
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
    const { settingsProps, autoSave, isCreationMode } = useSettingsAutoSave()
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
            {!isCreationMode && (
                <AutoSaveBadge
                    state={autoSave.state}
                    updatedAt={autoSave.updatedAt}
                    savedIcon={<Icon name="cloud-check" size={IconSize.Md} />}
                    tooltipPlacement="top-start"
                    variant="minimal"
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
                    <div>
                        <ArticleCategorySelect
                            locale={language.locale}
                            categoryId={category.categoryId}
                            onChange={category.onChangeCategory}
                            isDisabled={isCreationMode}
                        />
                    </div>
                </div>
                <div className={css.setting}>
                    <div>
                        <SelectCustomerVisibility
                            onChange={visibility.onChangeVisibility}
                            status={visibility.customerVisibility}
                            showNotification={false}
                            setShowNotification={() => {}}
                            isParentUnlisted={visibility.isParentUnlisted}
                            type="article"
                            className={css.visibilitySelect}
                            isDisabled={isCreationMode}
                        />
                    </div>
                </div>

                <div className={css.setting}>
                    {slug && (
                        <SlugInput
                            slug={slug.slug}
                            onChangeSlug={slug.onChangeSlug}
                            articleId={slug.articleId}
                            isDisabled={isCreationMode}
                        />
                    )}

                    <SeoMetaTitle
                        title={title}
                        metaTitle={metaTitle?.metaTitle ?? ''}
                        onChangeMetaTitle={
                            metaTitle?.onChangeMetaTitle ?? undefined
                        }
                        isDisabled={isCreationMode}
                    />
                    <ExcerptInput
                        excerpt={excerpt?.excerpt ?? ''}
                        onChangeExcerpt={excerpt?.onChangeExcerpt ?? undefined}
                        isDisabled={isCreationMode}
                    />

                    <SeoMetaDescription
                        defaultDescription={excerpt?.excerpt ?? ''}
                        metaDescription={metaDescription?.metaDescription ?? ''}
                        onChangeMetaDescription={
                            metaDescription?.onChangeMetaDescription ??
                            undefined
                        }
                        isDisabled={isCreationMode}
                    />
                </div>
            </div>
        </KnowledgeEditorSidePanelSection>
    )
}
