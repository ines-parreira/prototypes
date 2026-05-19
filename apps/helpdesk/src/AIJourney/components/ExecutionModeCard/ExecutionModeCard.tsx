import { useState } from 'react'

import {
    Box,
    Card,
    CardHeader,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Skeleton,
    Text,
} from '@gorgias/axiom'
import type { JourneyParticipationExecutionMode } from '@gorgias/convert-client'

import { ExecutionModeSelect } from 'AIJourney/formFields/ExecutionModeSelect/ExecutionModeSelect'

type Props = {
    isFormReady: boolean
    /** Form field name. Defaults to the journey-level field. */
    name?: string
    /** Title shown in the card header. Defaults to "Execution mode". */
    title?: string
    /** Description text under the title. */
    description?: string
    /**
     * When true, adds a "Use default" option that clears the override.
     * Use for journey-level (falls back to store), not for store-level.
     */
    showDefaultOption?: boolean
    /**
     * Resolved store-level execution mode. Used to render a concrete fallback
     * hint on the journey-level "Use store default" option.
     */
    storeFallbackMode?: JourneyParticipationExecutionMode | null
    /** Forwarded to the form field. See ExecutionModeSelect. */
    defaultOptionLabel?: string
    /** Forwarded to the form field. See ExecutionModeSelect. */
    defaultOptionDescription?: string
    /**
     * When true, the card renders as a collapsible Disclosure that starts
     * collapsed. Use on the journey Setup screen so the admin-only control
     * does not crowd the regular journey config. Defaults to false.
     */
    collapsible?: boolean
    isV3Architecture?: boolean
}

export const ExecutionModeCard = ({
    isFormReady,
    name = 'execution_mode_override',
    title = 'Execution mode',
    description = 'Internal-only control for what this flow does when it runs. Not visible to merchants.',
    showDefaultOption = true,
    storeFallbackMode,
    defaultOptionLabel,
    defaultOptionDescription,
    collapsible = false,
    isV3Architecture = false,
}: Props) => {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton
                    width={isV3Architecture ? undefined : 680}
                    height={collapsible ? 64 : 240}
                />
            </Box>
        )
    }

    const select = (
        <ExecutionModeSelect
            name={name}
            showDefaultOption={showDefaultOption}
            storeFallbackMode={storeFallbackMode}
            defaultOptionLabel={defaultOptionLabel}
            defaultOptionDescription={defaultOptionDescription}
            ariaLabel={title}
        />
    )

    if (isV3Architecture) {
        if (collapsible) {
            return (
                <Disclosure
                    isExpanded={isExpanded}
                    onExpandedChange={setIsExpanded}
                >
                    <DisclosureHeader
                        title={
                            <Text size="md" variant="medium">
                                {title}
                            </Text>
                        }
                    />
                    <DisclosurePanel pt="xs">
                        <Box flexDirection="column" gap="sm" width="100%">
                            <Text color="content-neutral-secondary">
                                {description}
                            </Text>
                            {select}
                        </Box>
                    </DisclosurePanel>
                </Disclosure>
            )
        }

        return (
            <Box flexDirection="column" gap="sm" width="100%">
                <CardHeader
                    title={title}
                    description={
                        <Text color="content-neutral-secondary">
                            {description}
                        </Text>
                    }
                />
                {select}
            </Box>
        )
    }

    if (collapsible) {
        return (
            <Card width={680}>
                <Disclosure
                    isExpanded={isExpanded}
                    onExpandedChange={setIsExpanded}
                >
                    <DisclosureHeader title={title} />
                    <DisclosurePanel pt="xs">
                        <Box flexDirection="column" gap="sm" width="100%">
                            <Text color="content-neutral-secondary">
                                {description}
                            </Text>
                            {select}
                        </Box>
                    </DisclosurePanel>
                </Disclosure>
            </Card>
        )
    }

    return (
        <Card width={680}>
            <CardHeader
                title={title}
                description={
                    <Text color="content-neutral-secondary">{description}</Text>
                }
            />
            {select}
        </Card>
    )
}
