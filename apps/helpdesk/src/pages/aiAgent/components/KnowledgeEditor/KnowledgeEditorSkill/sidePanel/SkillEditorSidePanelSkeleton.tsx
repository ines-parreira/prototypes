import { Skeleton } from '@gorgias/axiom'

import { KnowledgeEditorSidePanel } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

import sidePanelSkeletonCss from '../../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSkeleton.less'
import infoTabCss from './SkillEditorSidePanelInfoTab.less'

type Props = {
    tab: 'info' | 'performance'
}

const INFO_TAB_SECTIONS = [
    'details-skeleton',
    'intents-skeleton',
    'knowledge-skeleton',
]

const PERFORMANCE_TAB_SECTIONS = [
    'performance-skeleton',
    'recent-tickets-skeleton',
]

export const SkillEditorSidePanelSkeleton = ({ tab }: Props) => {
    if (tab === 'performance') {
        return (
            <KnowledgeEditorSidePanel
                initialExpandedSections={PERFORMANCE_TAB_SECTIONS}
                className={infoTabCss.sidePanel}
            >
                <KnowledgeEditorSidePanelSection
                    header={null}
                    sectionId="performance-skeleton"
                >
                    <Skeleton width={268} height={24} />
                    <div className={sidePanelSkeletonCss.section}>
                        <Skeleton height={64} />
                        <Skeleton height={64} />
                        <Skeleton height={64} />
                    </div>
                </KnowledgeEditorSidePanelSection>

                <KnowledgeEditorSidePanelSection
                    header={null}
                    sectionId="recent-tickets-skeleton"
                >
                    <Skeleton width={268} height={24} />
                    <div className={sidePanelSkeletonCss.section}>
                        <Skeleton height={69} />
                        <Skeleton height={69} />
                        <Skeleton height={69} />
                    </div>
                </KnowledgeEditorSidePanelSection>
            </KnowledgeEditorSidePanel>
        )
    }

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={INFO_TAB_SECTIONS}
            className={infoTabCss.sidePanel}
        >
            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="details-skeleton"
            >
                <Skeleton width={268} height={24} />
                <div className={sidePanelSkeletonCss.section}>
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                </div>
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="intents-skeleton"
            >
                <Skeleton width={268} height={24} />
                <div className={sidePanelSkeletonCss.section}>
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                </div>
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="knowledge-skeleton"
            >
                <Skeleton width={268} height={24} />
                <div className={sidePanelSkeletonCss.section}>
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                </div>
            </KnowledgeEditorSidePanelSection>
        </KnowledgeEditorSidePanel>
    )
}
