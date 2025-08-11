import { ReactNode } from 'react'

import { Card } from '@gorgias/analytics-ui-kit'
import { Button, Skeleton } from '@gorgias/axiom'

import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import css from 'domains/reporting/pages/common/components/IntentCard.less'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge/TrendBadge'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import IconInput from 'pages/common/forms/input/IconInput'

function CardBody({ children }: { children: ReactNode }) {
    return <div className={css.body}>{children}</div>
}

function CardHeader({ children }: { children: ReactNode }) {
    return <div className={css.header}>{children}</div>
}

function CardFooter({ children }: { children: ReactNode }) {
    return <div className={css.footer}>{children}</div>
}

export const LoadingSkeleton = () => (
    <Card className={css.content}>
        <CardBody>
            <CardHeader>
                <Skeleton width={154} height={24} />
            </CardHeader>
            <Skeleton />
        </CardBody>
        <CardFooter>
            <Skeleton width={77} />
            <Skeleton width={77} />
        </CardFooter>
    </Card>
)

const CTA_LABEL = 'View Tickets'

type OptionalWhileLoading<T extends object> =
    | ({ isLoading: true } & Partial<T>)
    | ({ isLoading?: false } & T)

type MaybeValue = number | null | undefined

export type IntentCardProps = {
    intent: string
    ticketCount: MaybeValue
    prevTicketCount: MaybeValue
    totalTicketCount: MaybeValue
    onViewTickets: () => void
}

const formatNumber = (maybeValue: MaybeValue) =>
    formatMetricValue(maybeValue, 'integer', NOT_AVAILABLE_PLACEHOLDER)

export function IntentCard({
    intent,
    ticketCount,
    prevTicketCount,
    totalTicketCount,
    onViewTickets,
    isLoading,
}: OptionalWhileLoading<IntentCardProps>) {
    if (isLoading) return <LoadingSkeleton />

    const [L1, L2, L3] = intent.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)

    const formattedTicketCount = formatNumber(ticketCount)
    const formattedTotalTicketCount = formatNumber(totalTicketCount)

    return (
        <Card className={css.content}>
            <CardBody>
                <CardHeader>
                    <h3 className={css.title}>
                        <span>{L1}</span>
                        <IconInput
                            icon="chevron_right"
                            style={{ color: 'inherit' }}
                        />
                        <span>{L2}</span>
                    </h3>
                    <TrendBadge
                        value={ticketCount}
                        prevValue={prevTicketCount}
                        interpretAs="less-is-better"
                    />
                </CardHeader>
                <p className={css.description}>{L3}</p>
            </CardBody>
            <CardFooter>
                <span className={css.stats}>
                    {formattedTicketCount}/{formattedTotalTicketCount} tickets
                </span>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    size="small"
                    onClick={onViewTickets}
                >
                    {CTA_LABEL}
                </Button>
            </CardFooter>
        </Card>
    )
}
