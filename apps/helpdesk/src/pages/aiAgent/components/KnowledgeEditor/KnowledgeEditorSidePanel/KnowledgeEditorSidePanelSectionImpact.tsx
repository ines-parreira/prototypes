import { useState } from 'react'

import { Button, Icon, Skeleton, Tag } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from './KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from './KnowledgeEditorSidePanelTwoColumnsContent'

import css from './KnowledgeEditorSidePanelSectionImpact.less'

export type MetricProps = {
    value?: number
    onClick?: () => void
}

export type Props = {
    tickets?: MetricProps | null
    handoverTickets?: MetricProps | null
    csat?: MetricProps | null
    intents?: string[] | null
    isLoading?: boolean
    sectionId: string
    subtitle?: string
}

export const KnowledgeEditorSidePanelSectionImpact = ({
    tickets,
    handoverTickets,
    csat,
    intents,
    isLoading,
    sectionId,
    subtitle,
}: Props) => {
    const MAX_VISIBLE_INTENTS = 3
    const [isIntentsExpanded, setIsIntentsExpanded] = useState(false)
    const visibleIntents = isIntentsExpanded
        ? intents
        : intents?.slice(0, MAX_VISIBLE_INTENTS)
    const hasMoreIntents = intents && intents.length > MAX_VISIBLE_INTENTS

    const renderValue = (metric: MetricProps | null | undefined) => {
        if (isLoading) {
            return <Skeleton key="loading" width={100} height={16} />
        }
        if (!metric || metric.value === undefined) return '-'
        if (!metric.onClick) return metric.value

        return (
            <a
                href="#"
                className={css.clickableValue}
                onClick={(e) => {
                    e.preventDefault()
                    metric.onClick?.()
                }}
            >
                {metric.value}
            </a>
        )
    }

    return (
        <KnowledgeEditorSidePanelSection
            header={{
                title: 'Impact',
                subtitle: subtitle ?? 'Last 28 days',
                tooltip:
                    'Performance in tickets where this knowledge was used by AI Agent in the last 28 days.',
            }}
            sectionId={sectionId}
        >
            <KnowledgeEditorSidePanelTwoColumnsContent
                columns={[
                    { left: 'Tickets', right: renderValue(tickets) },
                    {
                        left: 'Handover tickets',
                        right: renderValue(handoverTickets),
                    },
                    { left: 'CSAT', right: renderValue(csat) },
                    {
                        left: 'Intents',
                        right: isLoading ? (
                            <Skeleton
                                key="intents-loading"
                                width={100}
                                height={16}
                            />
                        ) : intents && intents.length > 0 ? (
                            <div key="intents" className={css.intentsContainer}>
                                {visibleIntents?.map((intent) => (
                                    <Tag key={intent}>
                                        {intent
                                            .replace(/::/g, '/')
                                            .toLowerCase()}
                                    </Tag>
                                ))}
                            </div>
                        ) : (
                            '-'
                        ),
                        fullWidth: !!(intents && intents.length > 0),
                    },
                ]}
            />
            {hasMoreIntents && !isLoading && (
                <div className={css.viewAllButtonContainer}>
                    <Button
                        variant="tertiary"
                        size="sm"
                        intent={'regular'}
                        trailingSlot={
                            <Icon
                                name={
                                    isIntentsExpanded
                                        ? 'arrow-chevron-up'
                                        : 'arrow-chevron-down'
                                }
                            />
                        }
                        onClick={() => setIsIntentsExpanded(!isIntentsExpanded)}
                    >
                        {isIntentsExpanded ? 'View Less' : 'View All'}
                    </Button>
                </div>
            )}
        </KnowledgeEditorSidePanelSection>
    )
}
