import { Link } from 'react-router-dom'

import { Tag, Text } from '@gorgias/axiom'

import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import {
    useArticleDetailsFromContext,
    useToggleAIAgentVisibility,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'
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
    const { toggleAIAgentVisibility } = useToggleAIAgentVisibility()
    const availableLocales = state.article?.available_locales ?? []
    const currentLocale = state.currentLocale
    const supportedLocales = config.supportedLocales

    const isViewingHistoricalVersion = state.historicalVersion !== null
    const isPublished = article ? article.isCurrent : undefined
    const isDraft = !article?.isCurrent
    const isUnlisted =
        state.article?.translation.visibility_status === 'UNLISTED'
    const canToggleAIAgent = !isDraft && !isViewingHistoricalVersion

    const getCurrentLocaleName = (): string => {
        const locale = supportedLocales.find(
            (loc) => loc.code === currentLocale,
        )
        return locale?.name ?? currentLocale
    }

    const getMultiLanguageTooltip = () => {
        const languageName = getCurrentLocaleName()
        const helpCenterUrl = helpCenter
            ? `${HELP_CENTER_BASE_PATH}/${helpCenter.id}/articles`
            : undefined

        return (
            <Text size="sm" className={css.tooltipContent}>
                You&apos;re viewing the default-language version of this
                article: {languageName}. AI Agent only uses this default
                version. You can manage other language articles in your{' '}
                {helpCenterUrl ? (
                    <Link to={helpCenterUrl}>Help Center.</Link>
                ) : (
                    'Help Center.'
                )}
            </Text>
        )
    }

    const getAiAgentVisibilityTooltip = (): string | undefined => {
        if (isViewingHistoricalVersion) {
            return 'Restore this version to be able to use it.'
        }

        if (isDraft) {
            return 'Publish your draft edits in order to enable this version for AI Agent'
        }

        return undefined
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
                        right: isViewingHistoricalVersion ? (
                            <Tag key="status">Previous version</Tag>
                        ) : isPublished !== undefined ? (
                            <Tag
                                key="status"
                                color={isPublished ? 'green' : 'grey'}
                            >
                                {isPublished ? 'Published' : 'Draft'}
                            </Tag>
                        ) : (
                            '-'
                        ),
                    },
                    {
                        left: 'In use by AI Agent',
                        right: (
                            <KnowledgeEditorSidePanelFieldAIAgentStatus
                                key="ai-agent-status"
                                checked={
                                    !isViewingHistoricalVersion &&
                                    !isDraft &&
                                    !isUnlisted
                                }
                                onChange={
                                    canToggleAIAgent
                                        ? toggleAIAgentVisibility
                                        : undefined
                                }
                                isDisabled={state.isUpdating}
                                tooltip={getAiAgentVisibilityTooltip()}
                                showMultiLanguageInfo={
                                    availableLocales.length > 1
                                }
                                multiLanguageTooltip={getMultiLanguageTooltip()}
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
