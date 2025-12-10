import classNames from 'classnames'

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
    isPublished?: boolean
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    articleUrl?: string
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleDetails = (
    props: Props,
) => (
    <KnowledgeEditorSidePanelSection
        header={{ title: 'Details' }}
        sectionId={props.sectionId}
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
                        props.isPublished !== undefined ? (
                            <span
                                key="status"
                                className={classNames(
                                    css.articleStatusBadge,
                                    commonCss.extraLeftMargin,
                                    props.isPublished && css.published,
                                )}
                            >
                                {props.isPublished ? 'Published' : 'Draft'}
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
                            checked={props.isPublished ?? false}
                            className={commonCss.extraLeftMargin}
                            tooltip={
                                props.isPublished
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
                            date={props.createdDatetime}
                            key="created"
                        />
                    ),
                },
                {
                    left: 'Last updated',
                    right: (
                        <KnowledgeEditorSidePanelFieldDateField
                            date={props.lastUpdatedDatetime}
                            key="last-updated"
                        />
                    ),
                },
                {
                    left: 'Article URL',
                    right: (
                        <KnowledgeEditorSidePanelFieldURL
                            url={props.articleUrl}
                            key="article-url"
                        />
                    ),
                },
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)
