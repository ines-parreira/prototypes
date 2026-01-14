import { Card, Skeleton } from '@gorgias/axiom'

import { KnowledgeEditorContentSkeleton } from './KnowledgeEditorContentSkeleton'
import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel/KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSkeleton } from './KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSkeleton'

import topBarCss from './KnowledgeEditorTopBar/KnowledgeEditorTopBar.less'
import css from './shared.less'

export const KnowledgeEditorLoadingShell = () => {
    return (
        <Card elevation="mid" padding={0} width={'100%'}>
            {/* Top Bar with Loading State */}
            <div
                className={topBarCss.container}
                data-name="knowledge-editor-top-bar-container"
            >
                <div className={topBarCss.title}>
                    <Skeleton width={268} height={12} />
                    <Skeleton width={268} height={12} />
                </div>
            </div>
            <div className={css.loadingSplitView}>
                <div className={css.editor}>
                    {/* Content Area with Loading State */}
                    <KnowledgeEditorContentSkeleton />
                </div>

                {/* Side Panel with Loading State */}
                <KnowledgeEditorSidePanel
                    initialExpandedSections={[
                        'details-skeleton',
                        'impact-skeleton',
                        'tickets-skeleton',
                    ]}
                >
                    <KnowledgeEditorSidePanelSkeleton />
                </KnowledgeEditorSidePanel>
            </div>
        </Card>
    )
}
