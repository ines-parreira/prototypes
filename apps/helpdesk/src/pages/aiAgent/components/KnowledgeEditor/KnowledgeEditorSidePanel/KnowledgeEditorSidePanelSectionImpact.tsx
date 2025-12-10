import { Skeleton, Tag } from '@gorgias/axiom'

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
}

export const KnowledgeEditorSidePanelSectionImpact = ({
    tickets,
    handoverTickets,
    csat,
    intents,
    isLoading,
    sectionId,
}: Props) => {
    const renderValue = (metric: MetricProps | null | undefined) => {
        if (isLoading) {
            return <Skeleton key="loading" width={100} height={20} />
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
                subtitle: 'Last 28 days',
                tooltip:
                    'Performance in tickets where this knowledge was used by AI Agent.',
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
                                height={20}
                            />
                        ) : intents && intents.length > 0 ? (
                            <div key="intents" className={css.intentsContainer}>
                                {intents.map((intent) => (
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
        </KnowledgeEditorSidePanelSection>
    )
}
