import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import { useArticleDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'
import { HELP_CENTER_BASE_PATH } from 'pages/settings/helpCenter/constants'

import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldURL,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import commonCss from '../KnowledgeEditorSidePanelCommonFields.less'
import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails.less'

export type Props = {
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleDetails = ({
    sectionId,
}: Props) => {
    const {
        article,
        createdDatetime,
        lastUpdatedDatetime,
        articleUrl,
        helpCenter,
    } = useArticleDetailsFromContext()

    const { state, config } = useArticleContext()
    const availableLocales = state.article?.available_locales ?? []
    const currentLocale = state.currentLocale
    const supportedLocales = config.supportedLocales

    const isPublished = article ? article.isCurrent : undefined

    const getCurrentLocaleName = (): string => {
        const locale = supportedLocales.find(
            (loc) => loc.code === currentLocale,
        )
        return locale?.name ?? currentLocale
    }

    const getMultiLanguageTooltipTitle = () => {
        const languageName = getCurrentLocaleName()
        return `You're viewing the default-language version of this article: ${languageName}. AI Agent only uses this default version. You can manage other languages articles in your Help Center.`
    }

    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: 'Details' }}
            sectionId={sectionId}
        >
            <KnowledgeEditorSidePanelTwoColumnsContent
                columns={[
                    {
                        left: 'Type',
                        right: (
                            <KnowledgeEditorSidePanelFieldKnowledgeType
                                key="type"
                                type="help-center-article"
                            />
                        ),
                    },
                    {
                        left: 'Status',
                        right:
                            isPublished !== undefined ? (
                                <span
                                    key="status"
                                    className={classNames(
                                        css.articleStatusBadge,
                                        commonCss.extraLeftMargin,
                                        isPublished && css.published,
                                    )}
                                >
                                    {isPublished ? 'Published' : 'Draft'}
                                </span>
                            ) : (
                                '-'
                            ),
                    },
                    {
                        left: 'In use by AI Agent',
                        right: (
                            <KnowledgeEditorSidePanelFieldAIAgentStatus
                                key="ai-agent-status"
                                checked={isPublished ?? false}
                                tooltip={
                                    isPublished
                                        ? 'Published articles are always available for AI Agent.'
                                        : 'Articles become available for AI Agent when published.'
                                }
                                showMultiLanguageInfo={
                                    availableLocales.length > 1
                                }
                                multiLanguageTooltipTitle={getMultiLanguageTooltipTitle()}
                            />
                        ),
                    },
                    {
                        left: 'Created',
                        right: (
                            <KnowledgeEditorSidePanelFieldDateField
                                date={createdDatetime}
                                key="created"
                            />
                        ),
                    },
                    {
                        left: 'Last updated',
                        right: (
                            <KnowledgeEditorSidePanelFieldDateField
                                date={lastUpdatedDatetime}
                                key="last-updated"
                            />
                        ),
                    },
                    {
                        left: 'Help Center',
                        right: helpCenter ? (
                            <Link
                                to={`${HELP_CENTER_BASE_PATH}/${helpCenter.id}/articles`}
                                className={commonCss.urlLink}
                            >
                                {helpCenter.label}
                            </Link>
                        ) : (
                            '-'
                        ),
                    },
                    {
                        left: 'Article URL',
                        right: (
                            <KnowledgeEditorSidePanelFieldURL
                                url={articleUrl}
                                key="article-url"
                            />
                        ),
                    },
                ]}
            />
        </KnowledgeEditorSidePanelSection>
    )
}
