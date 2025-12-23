import classNames from 'classnames'
import { Link } from 'react-router-dom'

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

    const isPublished = article ? article.isCurrent : undefined

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
                                className={commonCss.extraLeftMargin}
                                tooltip={
                                    isPublished
                                        ? 'Published articles are always available for AI Agent.'
                                        : 'Articles become available for AI Agent when published.'
                                }
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
