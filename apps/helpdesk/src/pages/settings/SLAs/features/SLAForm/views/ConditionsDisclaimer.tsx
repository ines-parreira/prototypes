import { useEffect, useRef, useState } from 'react'

import { Banner, Text } from '@gorgias/axiom'

import type { ConditionItem } from './ConditionsSelect/types'

type ConditionsDisclaimerProps = {
    conditions: ConditionItem[]
}

function formatConditionsSummary(conditions: ConditionItem[]): string {
    const tags = conditions
        .filter((c) => c.category === 'tags')
        .map((c) => c.displayLabel)
    const ticketFields = conditions
        .filter((c) => c.category === 'ticket_fields')
        .map((c) => c.displayLabel)

    const groups: string[] = []
    if (tags.length > 0) groups.push(`Tags: ${tags.join(', ')}`)
    if (ticketFields.length > 0)
        groups.push(`Ticket fields: ${ticketFields.join(', ')}`)

    return groups.join(' and ')
}

export function ConditionsDisclaimer({
    conditions,
}: ConditionsDisclaimerProps) {
    const [isDismissed, setIsDismissed] = useState(false)
    const prevLengthRef = useRef(conditions.length)

    useEffect(() => {
        if (conditions.length !== prevLengthRef.current) {
            setIsDismissed(false)
            prevLengthRef.current = conditions.length
        }
    }, [conditions.length])

    if (conditions.length === 0 || isDismissed) return null

    const summary = formatConditionsSummary(conditions)

    return (
        <Banner
            variant="inline"
            intent="info"
            size="md"
            isClosable
            isOpen
            onOpenChange={() => setIsDismissed(true)}
            description={
                <span style={{ whiteSpace: 'normal' }}>
                    This SLA applies to tickets from{' '}
                    <Text as="span" variant="bold" size="md">
                        any
                    </Text>{' '}
                    of the selected channels that also match{' '}
                    <Text as="span" variant="bold" size="md">
                        all conditions at the same time
                    </Text>{' '}
                    ({summary}).
                </span>
            }
        />
    )
}
