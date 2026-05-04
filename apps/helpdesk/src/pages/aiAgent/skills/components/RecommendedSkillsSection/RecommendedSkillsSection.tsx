import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Box, Button, Heading, Text } from '@gorgias/axiom'

import { SkillsTemplateCard } from 'pages/aiAgent/skills/components/SkillsTemplateCard/SkillsTemplateCard'
import type { SkillCoverageData } from 'pages/aiAgent/skills/components/SkillsTemplateCard/SkillsTemplateCard'
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

    const sortedTemplatesWithCoverage = useMemo(() => {
        const templatesWithCoverage = skillsTemplates.map((template) => {
            const ticketVolume = template.intents.reduce(
                (sum, intent) =>
                    sum + (metricsMap.get(intent.name)?.ticketVolume ?? 0),
                0,
            )
            return {
                template,
                ticketVolume,
                data: isLoadingMetrics
                    ? null
                    : ({
                          type: 'ticket-volume' as const,
                          ticketVolume,
                          ticketVolumePercent:
                              totalAiAgentTickets > 0
                                  ? Math.round(
                                        (ticketVolume / totalAiAgentTickets) *
                                            1000,
                                    ) / 10
                                  : 0,
                      } satisfies SkillCoverageData),
            }
        })

        return templatesWithCoverage.sort(
            (a, b) => b.ticketVolume - a.ticketVolume,
        )
    }, [skillsTemplates, metricsMap, totalAiAgentTickets, isLoadingMetrics])

    const hasAnyCoverage = useMemo(
        () =>
            sortedTemplatesWithCoverage.some(
                ({ ticketVolume }) => ticketVolume > 0,
            ),
        [sortedTemplatesWithCoverage],
    )

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
    }, [updateScrollState, sortedTemplatesWithCoverage])

    const handleScrollLeft = useCallback(() => {
        cardsRowRef.current?.scrollBy({ left: -476, behavior: 'smooth' })
    }, [])

    const handleScrollRight = useCallback(() => {
        cardsRowRef.current?.scrollBy({ left: 476, behavior: 'smooth' })
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
                    Based on your ticket volume, these skills will have the
                    biggest impact.
                </Text>
            </Box>
            <Box
                className={css.cardsRow}
                ref={cardsRowRef}
                onScroll={updateScrollState}
            >
                {sortedTemplatesWithCoverage.map(({ template, data }) => (
                    <SkillsTemplateCard
                        key={template.id}
                        skillTemplate={template}
                        onCTA={() => onCreateSkillsFromTemplate(template.id)}
                        coverage={{
                            isLoading: isLoadingMetrics,
                            hasAnyCoverage,
                            data,
                        }}
                    />
                ))}
            </Box>
        </Box>
    )
}
