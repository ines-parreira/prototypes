import classNames from 'classnames'

import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldURL,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails.less'

type Props = {
    isPublished?: boolean
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    articleUrl?: string
    articleId?: string
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
                [
                    'Type',
                    <KnowledgeEditorSidePanelFieldKnowledgeType
                        key="type"
                        type="help-center-article"
                    />,
                ],
                [
                    'Status',
                    props.isPublished !== undefined ? (
                        <span
                            key="status"
                            className={classNames(
                                css.articleStatusBadge,
                                css.extraLeftMargin,
                                props.isPublished && css.published,
                            )}
                        >
                            {props.isPublished ? 'Published' : 'Draft'}
                        </span>
                    ) : (
                        '-'
                    ),
                ],
                [
                    'AI Agent status',
                    <KnowledgeEditorSidePanelFieldAIAgentStatus
                        key="ai-agent-status"
                        checked={props.isPublished ?? false}
                        className={css.extraLeftMargin}
                        tooltip={
                            props.isPublished
                                ? 'Published articles are always available for AI Agent.'
                                : 'Articles become available for AI Agent when published.'
                        }
                    />,
                ],
                [
                    'Created',
                    <KnowledgeEditorSidePanelFieldDateField
                        date={props.createdDatetime}
                        key="created"
                    />,
                ],
                [
                    'Last updated',
                    <KnowledgeEditorSidePanelFieldDateField
                        date={props.lastUpdatedDatetime}
                        key="last-updated"
                    />,
                ],
                [
                    'Article URL',
                    props.articleUrl ? (
                        <KnowledgeEditorSidePanelFieldURL
                            url={props.articleUrl}
                            key="article-url"
                        />
                    ) : (
                        '-'
                    ),
                ],
                ['Article ID', props.articleId ? props.articleId : '-'],
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)
