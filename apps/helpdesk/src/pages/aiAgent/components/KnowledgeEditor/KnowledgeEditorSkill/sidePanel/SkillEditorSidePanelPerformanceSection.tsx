import { Box, Icon, Text } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { SkillEditorSidePanelPerformanceMetricCards } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelPerformanceMetricCards'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelPerformanceSection = ({
    sectionId,
}: Props) => {
    const { skillMetrics, recentTickets, historicalVersionDateRange } =
        useSkillPerformanceFromContext()

    const hasMetrics = skillMetrics.metrics !== null
    const hasRecentTickets =
        recentTickets !== undefined &&
        recentTickets.ticketCount !== undefined &&
        recentTickets.ticketCount > 0
    const isDataLoading = skillMetrics.isLoading || recentTickets?.isLoading
    const hasNoData = !isDataLoading && !hasMetrics && !hasRecentTickets

    return (
        <KnowledgeEditorSidePanelSection
            header={{
                title: 'Performance',
                subtitle: formatDateRangeSubtitle(historicalVersionDateRange),
            }}
            sectionId={sectionId}
        >
            {hasNoData ? (
                <Box
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="sm"
                >
                    <Icon name="chart-bar-vertical" />
                    <Box
                        width="220px"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap="xxxxs"
                    >
                        <Text size="md" variant="bold">
                            No data yet
                        </Text>
                        <Text
                            size="sm"
                            color="content-neutral-tertiary"
                            align="center"
                        >
                            Data will appear here once AI Agent handles
                            conversations using this skill.
                        </Text>
                    </Box>
                </Box>
            ) : (
                <SkillEditorSidePanelPerformanceMetricCards {...skillMetrics} />
            )}
        </KnowledgeEditorSidePanelSection>
    )
}
