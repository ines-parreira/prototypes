import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useSkillReportingEnabled } from 'pages/aiAgent/skills/hooks/useSkillReportingEnabled'

import { Box, Button, Heading, Icon, Text } from '@gorgias/axiom'

import {
    SkillPerformanceDataProvider,
    useSkillPerformanceFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { SkillEditorSidePanelRecentTicketsSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelRecentTicketsSection'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'

import { SkillEditorSidePanelPerformanceMetricCards } from './SkillEditorSidePanelPerformanceMetricCards'
import { SkillPerformanceTrendModal } from './SkillPerformanceTrendModal'

import css from './SkillEditorSidePanelPerformanceTab.less'

export const SkillEditorSidePanelPerformanceTab = () => {
    const [isTrendModalOpen, setIsTrendModalOpen] = useState(false)
    const isNewReportingLayerEnabled = useSkillReportingEnabled()
    const skillPerformanceData = useSkillPerformanceFromContext()
    const { skillMetrics, recentTickets, historicalVersionDateRange } =
        skillPerformanceData

    const handleExploreTrendClick = () => {
        logEvent(SegmentEvent.AiAgentExploreTrendPerSkillClicked, {
            skillId: skillMetrics.resourceSourceId,
        })
        setIsTrendModalOpen(true)
    }

    const hasMetrics = skillMetrics.metrics !== null
    const hasRecentTickets =
        recentTickets !== undefined &&
        recentTickets.ticketCount !== undefined &&
        recentTickets.ticketCount > 0
    const isDataLoading = skillMetrics.isLoading || recentTickets?.isLoading
    const hasNoData = !isDataLoading && !hasMetrics && !hasRecentTickets

    return (
        <SkillPerformanceDataProvider value={skillPerformanceData}>
            <Box className={css.performanceTab}>
                <Box className={css.performanceSection}>
                    <Box display="flex" flexDirection="column">
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="sm"
                        >
                            <Heading>Performance</Heading>
                            {isNewReportingLayerEnabled && (
                                <Button
                                    className={css.exploreTrendButton}
                                    variant="secondary"
                                    size="md"
                                    leadingSlot="chart-line"
                                    aria-label="Explore trend"
                                    onClick={handleExploreTrendClick}
                                >
                                    Explore trend
                                </Button>
                            )}
                        </Box>
                        <Text size="sm" color="content-neutral-tertiary">
                            {formatDateRangeSubtitle(
                                historicalVersionDateRange,
                            )}
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
                {isNewReportingLayerEnabled && isTrendModalOpen && (
                    <SkillPerformanceTrendModal
                        isOpen={isTrendModalOpen}
                        onOpenChange={setIsTrendModalOpen}
                    />
                )}
            </Box>
        </SkillPerformanceDataProvider>
    )
}
