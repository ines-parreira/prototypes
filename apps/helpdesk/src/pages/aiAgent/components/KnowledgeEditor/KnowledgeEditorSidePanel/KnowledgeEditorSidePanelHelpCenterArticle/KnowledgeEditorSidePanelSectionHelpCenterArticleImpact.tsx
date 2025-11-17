import { LegacyChip as Chip } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact.less'

export type MetricProps = {
    value?: number
    onClick?: () => void
}

export type Props = {
    tickets?: MetricProps
    handoverTickets?: MetricProps
    csat?: MetricProps
    intents?: string[]
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleImpact = ({
    tickets,
    handoverTickets,
    csat,
    intents,
    sectionId,
}: Props) => {
    const renderValue = (metric: MetricProps | undefined) => {
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
                    ['Tickets', renderValue(tickets)],
                    ['Handover tickets', renderValue(handoverTickets)],
                    ['CSAT', renderValue(csat)],
                    [
                        'Intents',
                        intents && intents.length > 0 ? (
                            <div key="intents" className={css.intentsContainer}>
                                {intents.map((intent) => (
                                    <Chip
                                        key={intent}
                                        id={intent}
                                        label={intent}
                                        isActive={false}
                                        onClick={() => {}}
                                    />
                                ))}
                            </div>
                        ) : (
                            '-'
                        ),
                    ],
                ]}
            />
        </KnowledgeEditorSidePanelSection>
    )
}
