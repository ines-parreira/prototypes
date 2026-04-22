import { Box, Card, Skeleton } from '@gorgias/axiom'

import { KnowledgeEditorContentSkeleton } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorContentSkeleton'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

import sidePanelSkeletonCss from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSkeleton.less'
import css from './KnowledgeEditorSkill.less'
import sidePanelCss from './sidePanel/SkillEditorSidePanel.less'

const INITIAL_EXPANDED_SECTIONS = [
    'details-skeleton',
    'intents-skeleton',
    'knowledge-skeleton',
    'performance-skeleton',
    'recent-tickets-skeleton',
]

type Props = {
    isPreview: boolean
}

export const KnowledgeEditorSkillLoadingShell = ({ isPreview }: Props) => {
    return (
        <Box flexDirection="column" width="100%" height="100%">
            {isPreview && (
                <Box
                    alignItems="center"
                    justifyContent="space-between"
                    padding="md"
                    height="52px"
                    className={css.header}
                >
                    <Box alignItems="center" gap="sm" flex={1}>
                        <Skeleton width={200} height={20} />
                    </Box>
                    <Box gap="xs" alignItems="center">
                        <Skeleton width={64} height={32} borderRadius={8} />
                        <Skeleton width={130} height={32} borderRadius={8} />
                        <Skeleton width={100} height={32} borderRadius={8} />
                    </Box>
                </Box>
            )}
            <Card
                elevation="mid"
                className={css.editor}
                padding={0}
                height="100%"
            >
                <Box flexDirection="row" height="100%">
                    <Box flexDirection="column" flex={1} height="100%">
                        {!isPreview && (
                            <Box
                                alignItems="center"
                                justifyContent="space-between"
                                padding="lg"
                                height="80px"
                            >
                                <Box alignItems="center" gap="sm" flex={1}>
                                    <Skeleton
                                        width={32}
                                        height={32}
                                        borderRadius={8}
                                    />
                                    <Skeleton width={200} height={20} />
                                </Box>
                                <Box gap="xs" alignItems="center">
                                    <Skeleton
                                        width={80}
                                        height={32}
                                        borderRadius={8}
                                    />
                                    <Skeleton
                                        width={80}
                                        height={32}
                                        borderRadius={8}
                                    />
                                </Box>
                            </Box>
                        )}

                        <Box
                            flexDirection="column"
                            flex={1}
                            alignItems="center"
                        >
                            <div className={css.editor}>
                                <KnowledgeEditorContentSkeleton />
                            </div>
                        </Box>
                    </Box>

                    <Box flexDirection="row" className={sidePanelCss.sidePanel}>
                        <div className={sidePanelCss.contentArea}>
                            <KnowledgeEditorSidePanel
                                initialExpandedSections={
                                    INITIAL_EXPANDED_SECTIONS
                                }
                                className={sidePanelCss.sidePanelSection}
                            >
                                <KnowledgeEditorSidePanelSection
                                    header={null}
                                    sectionId="details-skeleton"
                                >
                                    <Skeleton width={268} height={24} />
                                    <div
                                        className={sidePanelSkeletonCss.section}
                                    >
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
                                    <div
                                        className={sidePanelSkeletonCss.section}
                                    >
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
                                    <div
                                        className={sidePanelSkeletonCss.section}
                                    >
                                        <Skeleton height={12} />
                                        <Skeleton height={12} />
                                        <Skeleton height={12} />
                                    </div>
                                </KnowledgeEditorSidePanelSection>

                                {isPreview && (
                                    <>
                                        <KnowledgeEditorSidePanelSection
                                            header={null}
                                            sectionId="performance-skeleton"
                                        >
                                            <Skeleton width={268} height={24} />
                                            <div
                                                className={
                                                    sidePanelSkeletonCss.section
                                                }
                                            >
                                                <Skeleton height={12} />
                                                <Skeleton height={12} />
                                                <Skeleton height={12} />
                                            </div>
                                        </KnowledgeEditorSidePanelSection>

                                        <KnowledgeEditorSidePanelSection
                                            header={null}
                                            sectionId="recent-tickets-skeleton"
                                        >
                                            <Skeleton width={268} height={24} />
                                            <div
                                                className={
                                                    sidePanelSkeletonCss.section
                                                }
                                            >
                                                <Skeleton height={12} />
                                                <Skeleton height={12} />
                                                <Skeleton height={12} />
                                            </div>
                                        </KnowledgeEditorSidePanelSection>
                                    </>
                                )}
                            </KnowledgeEditorSidePanel>
                            <div className={sidePanelCss.contentDivider}></div>
                        </div>

                        {!isPreview && (
                            <div className={sidePanelCss.iconBar}>
                                <Skeleton
                                    width={32}
                                    height={32}
                                    borderRadius={8}
                                />
                                <Skeleton
                                    width={32}
                                    height={32}
                                    borderRadius={8}
                                />
                                <Skeleton
                                    width={32}
                                    height={32}
                                    borderRadius={8}
                                />
                            </div>
                        )}
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}
