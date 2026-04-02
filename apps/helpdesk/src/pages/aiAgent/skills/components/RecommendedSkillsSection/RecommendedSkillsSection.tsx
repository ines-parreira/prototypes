import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Box, Button, Heading, Text } from '@gorgias/axiom'

import { SkillsTemplateCard } from 'pages/aiAgent/skills/components/SkillsTemplateCard/SkillsTemplateCard'
import { useIntentsMetrics } from 'pages/aiAgent/skills/hooks/useIntentsMetrics'
import { useTotalAiAgentTickets } from 'pages/aiAgent/skills/hooks/useTotalAiAgentTickets'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import css from './RecommendedSkillsSection.less'

type Props = {
    skillsTemplates: SkillTemplate[]
    onCreateSkillsFromTemplate: (templateId: string) => void
}

export const RecommendedSkillsSection: React.FC<Props> = ({
    skillsTemplates,
    onCreateSkillsFromTemplate,
}) => {
    const { data: metricsMap, isLoading: isLoadingMetrics } =
        useIntentsMetrics()
    const { totalCount: totalAiAgentTickets } = useTotalAiAgentTickets()

    const sortedTemplatesWithStats = useMemo(() => {
        const templatesWithStats = skillsTemplates.map((template) => {
            const ticketVolume = template.intents.reduce(
                (sum, intent) =>
                    sum + (metricsMap.get(intent.name)?.ticketVolume ?? 0),
                0,
            )
            const handoverCount = template.intents.reduce(
                (sum, intent) =>
                    sum + (metricsMap.get(intent.name)?.handoverCount ?? 0),
                0,
            )
            return {
                template,
                stats: isLoadingMetrics
                    ? null
                    : {
                          ticketVolume,
                          ticketVolumePercent:
                              totalAiAgentTickets > 0
                                  ? Math.round(
                                        (ticketVolume / totalAiAgentTickets) *
                                            1000,
                                    ) / 10
                                  : 0,
                          handoverCount,
                          handoverPercent:
                              ticketVolume > 0
                                  ? Math.round(
                                        (handoverCount / ticketVolume) * 1000,
                                    ) / 10
                                  : 0,
                      },
            }
        })

        return templatesWithStats.sort(
            (a, b) =>
                (b.stats?.ticketVolume ?? 0) - (a.stats?.ticketVolume ?? 0),
        )
    }, [skillsTemplates, metricsMap, totalAiAgentTickets, isLoadingMetrics])

    const cardsRowRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const updateScrollState = useCallback(() => {
        const el = cardsRowRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth)
    }, [])

    useEffect(() => {
        updateScrollState()
    }, [updateScrollState, sortedTemplatesWithStats])

    const handleScrollLeft = useCallback(() => {
        cardsRowRef.current?.scrollBy({ left: -416, behavior: 'smooth' })
    }, [])

    const handleScrollRight = useCallback(() => {
        cardsRowRef.current?.scrollBy({ left: 416, behavior: 'smooth' })
    }, [])

    return (
        <Box width="100%" className={css.container}>
            <Box className={css.header}>
                <Box alignItems="center" justifyContent="space-between">
                    <Heading size="md">Recommended skills</Heading>
                    <Box>
                        <Button
                            variant="tertiary"
                            size="sm"
                            isDisabled={!canScrollLeft}
                            onClick={handleScrollLeft}
                            aria-label="Scroll left"
                            icon="arrow-chevron-left"
                        />
                        <Button
                            variant="tertiary"
                            size="sm"
                            isDisabled={!canScrollRight}
                            onClick={handleScrollRight}
                            aria-label="Scroll right"
                            icon="arrow-chevron-right"
                        />
                    </Box>
                </Box>
                <Text size="md" variant="regular" className={css.description}>
                    Intents that would benefit most from a dedicated skill,
                    based on your ticket volume and handover rate
                </Text>
            </Box>
            <Box
                className={css.cardsRow}
                ref={cardsRowRef}
                onScroll={updateScrollState}
            >
                {sortedTemplatesWithStats.map(({ template, stats }, index) => (
                    <SkillsTemplateCard
                        key={template.id}
                        skillTemplate={template}
                        onCreateSkillsFromTemplate={() =>
                            onCreateSkillsFromTemplate(template.id)
                        }
                        className={css.templateCard}
                        hasStats
                        hasCTA
                        hasActiveCTA={index === 0}
                        stats={stats}
                        isLoadingStats={isLoadingMetrics}
                    />
                ))}
            </Box>
        </Box>
    )
}
