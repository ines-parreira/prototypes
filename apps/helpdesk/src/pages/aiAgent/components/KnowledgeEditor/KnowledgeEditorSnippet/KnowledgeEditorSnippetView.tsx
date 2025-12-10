import { useState } from 'react'

import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import type { Props as ImpactProps } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
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
}

type Snippet = URLSnippet | DocumentSnippet | StoreWebsiteSnippet

type Props = {
    onClose: () => void
    onClickPrevious: () => void
    onClickNext: () => void
    onToggleFullscreen: () => void
    onTest: () => void
    onToggleAIAgentEnabled: () => Promise<void>

    isFullscreen: boolean
    snippet: Snippet
    impact?: Omit<ImpactProps, 'sectionId'>
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
    impact,
}: Props) => {
    const [isDetailsView, setIsDetailsView] = useState(true)
    const onToggleDetailsView = () => {
        setIsDetailsView(!isDetailsView)
    }

    const getSourceDisplay = (): string => {
        if (snippet.type === SnippetType.Store) {
            return snippet.sources.join(', ')
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
                value: snippet.aiAgentEnabled === 'PUBLIC',
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
                    />
                )
        }
    }

    return (
        <div className={css.knowledgeEditorContainer}>
            <KnowledgeEditorTopBar
                title={'Snippet'}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClose}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
            >
                <KnowledgeEditorTopBarSnippetControls onTest={onTest} />
            </KnowledgeEditorTopBar>
            <div className={css.knowledgeEditor}>
                <KnowledgeEditorSnippetReadView
                    title={snippet.title}
                    content={snippet.content}
                    sourceLabel={getSourceDisplay()}
                    sourceUrl={getSourceUrl()}
                    snippetType={snippet.type}
                />
                {isDetailsView && renderSidePanel()}
            </div>
        </div>
    )
}
