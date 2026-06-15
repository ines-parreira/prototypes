import {
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Heading,
    Icon,
    Text,
} from '@gorgias/axiom'
import type { VoiceCallSummariesItem } from '@gorgias/helpdesk-types'

type VoiceCallSummaryProps = {
    summaries: readonly VoiceCallSummariesItem[]
}

export function VoiceCallSummary({ summaries }: VoiceCallSummaryProps) {
    if (summaries.length === 0) {
        return null
    }

    return (
        <Disclosure defaultExpanded>
            <DisclosureHeader
                title={<Heading size="sm">Call summary</Heading>}
                leadingSlot={<Icon name="ai-ticket-summary" />}
                trailingSlot={({ isExpanded }) => (
                    <DropdownIcon isOpen={isExpanded} size="sm" />
                )}
            />
            <DisclosurePanel flexDirection="column" gap="xxs" pt="xs">
                {[...summaries]
                    .sort((a, b) =>
                        a.created_datetime.localeCompare(b.created_datetime),
                    )
                    .map((summary) => (
                        <Text key={summary.id} color="content-neutral-default">
                            {summary.summary}
                        </Text>
                    ))}
            </DisclosurePanel>
        </Disclosure>
    )
}
