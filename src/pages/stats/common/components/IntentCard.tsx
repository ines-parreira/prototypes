import { Card } from '@gorgias/analytics-ui-kit'
import { Button } from '@gorgias/merchant-ui-kit'

import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/common/components/IntentCard.less'
import TrendBadge from 'pages/stats/common/components/TrendBadge/TrendBadge'
import { formatNumber } from 'pages/stats/common/utils'

const CTA_LABEL = 'View Tickets'

export type IntentCardProps = {
    title: string
    description: string
    ticketCount: number
    prevTicketCount: number
    totalTicketCount: number
    onViewTickets: () => void
}

const inboxIcon = <IconInput icon="inbox" />

export function IntentCard({
    title,
    description,
    ticketCount,
    prevTicketCount,
    totalTicketCount,
    onViewTickets,
}: IntentCardProps) {
    const formattedTicketCount = formatNumber(ticketCount)
    const formattedTotalTicketCount = formatNumber(totalTicketCount)

    return (
        <Card className={css.content}>
            <div className={css.body}>
                <div className={css.header}>
                    <h3 className={css.title}>{title}</h3>
                    <TrendBadge
                        value={ticketCount}
                        prevValue={prevTicketCount}
                        interpretAs="less-is-better"
                    />
                </div>
                <p className={css.description}>{description}</p>
            </div>
            <div className={css.footer}>
                <span className={css.stats}>
                    {formattedTicketCount}/{formattedTotalTicketCount} tickets
                </span>
                <Button
                    leadingIcon={inboxIcon}
                    intent="secondary"
                    fillStyle="ghost"
                    size="small"
                    onClick={onViewTickets}
                >
                    {CTA_LABEL}
                </Button>
            </div>
        </Card>
    )
}
