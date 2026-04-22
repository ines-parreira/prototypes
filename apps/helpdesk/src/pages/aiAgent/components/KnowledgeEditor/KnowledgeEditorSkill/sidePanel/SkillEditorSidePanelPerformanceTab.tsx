import { Box, Heading, Icon, Text } from '@gorgias/axiom'

import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { SkillEditorSidePanelRecentTicketsSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelRecentTicketsSection'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'

import { SkillEditorSidePanelPerformanceMetricCards } from './SkillEditorSidePanelPerformanceMetricCards'

import css from './SkillEditorSidePanel.less'

export const SkillEditorSidePanelPerformanceTab = () => {
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
        <Box className={css.performanceTab}>
            <Box className={css.performanceSection}>
                <Box display="flex" flexDirection="column">
                    <Heading>Performance</Heading>
                    <Text size="sm" color="content-neutral-tertiary">
                        {formatDateRangeSubtitle(historicalVersionDateRange)}
                    </Text>
                </Box>

                {!hasNoData && (
                    <SkillEditorSidePanelPerformanceMetricCards
                        {...skillMetrics}
                    />
                )}
            </Box>
            {hasNoData ? (
                <Box
                    flexGrow={1}
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
                <SkillEditorSidePanelRecentTicketsSection sectionId="recent-tickets" />
            )}
        </Box>
    )
}
