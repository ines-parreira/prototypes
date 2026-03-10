import { useState } from 'react'

import { Card } from '@gorgias/axiom'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import type { Props as ImpactProps } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import type { Props as RecentTicketsProps } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelDocumentSnippet } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelDocumentSnippet'
import { KnowledgeEditorSidePanelStoreSnippet } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelStoreSnippet'
import { KnowledgeEditorSidePanelURLSnippet } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelURLSnippet'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import { KnowledgeEditorTopBarSnippetControls } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarSnippetControls'
import { KnowledgeEditorSnippetReadView } from './KnowledgeEditorSnippetReadView'

import css from './KnowledgeEditorSnippetView.less'

type BaseSnippet = {
    id: number
    title: string
    content: string
    aiAgentEnabled: string
    createdDatetime: Date
    lastUpdatedDatetime: Date
}

type URLSnippet = BaseSnippet & {
    type: SnippetType.URL
    source: string
}

type DocumentSnippet = BaseSnippet & {
    type: SnippetType.Document
    source: string
    googleStorageUrl: string
}

type StoreWebsiteSnippet = BaseSnippet & {
    type: SnippetType.Store
    sources: string[]
    domain?: string
}

type Snippet = URLSnippet | DocumentSnippet | StoreWebsiteSnippet

type Props = {
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onToggleFullscreen: () => void
    onTest: () => void
    onToggleAIAgentEnabled: () => Promise<void>

    isFullscreen: boolean
    isPlaygroundOpen?: boolean
    snippet: Snippet
    shouldHideFullscreenButton: boolean
    impact?: Omit<ImpactProps, 'sectionId'>
    recentTickets?: Omit<RecentTicketsProps, 'sectionId'>
    helpCenterId?: number
    locale?: string
}

export const KnowledgeEditorSnippetView = ({
    onToggleFullscreen,
    onClose,
    onClickPrevious,
    onClickNext,
    onTest,
    onToggleAIAgentEnabled,
    snippet,
    isFullscreen,
    isPlaygroundOpen,
    shouldHideFullscreenButton,
    impact,
    recentTickets,
    helpCenterId,
    locale,
}: Props) => {
    const [isDetailsView, setIsDetailsView] = useState(true)
    const onToggleDetailsView = () => {
        setIsDetailsView(!isDetailsView)
    }

    const getSourceDisplay = (): string => {
        if (snippet.type === SnippetType.Store) {
            return snippet.domain ?? ''
        }
        return snippet.source
    }

    const getSourceUrl = (): string => {
        if (snippet.type === SnippetType.Document && snippet.googleStorageUrl) {
            return snippet.googleStorageUrl
        }

        // fallback to url matching the label(display)
        return getSourceDisplay()
    }
    const renderSidePanel = () => {
        const baseDetails = {
            aiAgentStatus: {
                value: snippet.aiAgentEnabled === VisibilityStatusEnum.PUBLIC,
                onChange: onToggleAIAgentEnabled,
            },
            createdDatetime: snippet.createdDatetime,
            lastUpdatedDatetime: snippet.lastUpdatedDatetime,
        }

        switch (snippet.type) {
            case SnippetType.URL:
                return (
                    <KnowledgeEditorSidePanelURLSnippet
                        details={{
                            ...baseDetails,
                            url: snippet.source,
                        }}
                        impact={impact}
                        recentTickets={recentTickets}
                        snippetId={snippet.id}
                        helpCenterId={helpCenterId}
                        locale={locale}
                    />
                )
            case SnippetType.Document:
                return (
                    <KnowledgeEditorSidePanelDocumentSnippet
                        details={{
                            ...baseDetails,
                            sourceDocument: snippet.source,
                            googleStorageUrl: snippet.googleStorageUrl,
                        }}
                        impact={impact}
                        recentTickets={recentTickets}
                        snippetId={snippet.id}
                        helpCenterId={helpCenterId}
                        locale={locale}
                    />
                )
            case SnippetType.Store:
                return (
                    <KnowledgeEditorSidePanelStoreSnippet
                        details={{
                            ...baseDetails,
                            urls: snippet.sources,
                        }}
                        impact={impact}
                        recentTickets={recentTickets}
                        snippetId={snippet.id}
                        helpCenterId={helpCenterId}
                        locale={locale}
                    />
                )
        }
    }

    return (
        <Card
            elevation="mid"
            className={css.knowledgeEditorContainer}
            padding={0}
        >
            <KnowledgeEditorTopBar
                title={'Snippet'}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClose}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
                shouldHideFullscreenButton={shouldHideFullscreenButton}
            >
                <KnowledgeEditorTopBarSnippetControls
                    onTest={onTest}
                    isPlaygroundOpen={isPlaygroundOpen}
                />
            </KnowledgeEditorTopBar>
            <div className={css.knowledgeEditor}>
                <div className={css.editorContainer}>
                    <KnowledgeEditorSnippetReadView
                        title={snippet.title}
                        content={snippet.content}
                        sourceLabel={getSourceDisplay()}
                        sourceUrl={getSourceUrl()}
                        snippetType={snippet.type}
                    />
                </div>
                {isDetailsView && renderSidePanel()}
            </div>
        </Card>
    )
}
