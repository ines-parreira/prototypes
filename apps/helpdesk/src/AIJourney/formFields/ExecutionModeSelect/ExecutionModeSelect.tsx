import { Controller, useFormContext } from 'react-hook-form'

import { Box, RadioCard, RadioGroup } from '@gorgias/axiom'
import type { JourneyParticipationExecutionMode } from '@gorgias/convert-client'

const DEFAULT_VALUE = '__default__' as const

const EXECUTION_MODE_OPTIONS: Array<{
    label: string
    value: JourneyParticipationExecutionMode
    description: string
}> = [
    {
        label: 'Dry run',
        value: 'dry-run',
        description: 'No tickets created, no SMS sent.',
    },
    {
        label: 'Trial',
        value: 'trial',
        description: 'Tickets and messages created, SMS skipped.',
    },
    {
        label: 'Regular',
        value: 'regular',
        description: 'Full flow: tickets created, SMS sent.',
    },
]

type ExecutionModeFieldValue =
    | JourneyParticipationExecutionMode
    | null
    | undefined

type Props = {
    name: string
    /**
     * When true, adds an option that sets the field to null on write (clears
     * the override). Both the journey-level and store-level forms use this:
     * journey-level falls back to the store value, store-level falls back to
     * the system DRY_RUN default.
     */
    showDefaultOption?: boolean
    /**
     * Resolved store-level execution mode, used to render a concrete
     * "Falls back to: <mode>" hint on the journey-level "Use store default"
     * option. Pass `undefined` while the value is still loading and `null`
     * when the store has no override set.
     */
    storeFallbackMode?: JourneyParticipationExecutionMode | null
    /**
     * Title for the "clear override" radio option. Defaults to "Use store
     * default" (journey-level). Pass "No override" for store-level so the
     * label matches what clearing actually means at that level.
     */
    defaultOptionLabel?: string
    /**
     * Description for the "clear override" radio option. When omitted at the
     * journey level, the description is computed from `storeFallbackMode`.
     */
    defaultOptionDescription?: string
    /** Accessible label announced for the radio group. Defaults to "Execution mode". */
    ariaLabel?: string
}

const FALLBACK_MODE_LABEL: Record<JourneyParticipationExecutionMode, string> = {
    'dry-run': 'Dry run',
    test: 'Test',
    trial: 'Trial',
    regular: 'Regular',
    'convert-only': 'Convert only',
}

const buildFallbackDescription = (
    storeFallbackMode: JourneyParticipationExecutionMode | null | undefined,
): string => {
    if (storeFallbackMode === undefined) {
        return 'Loading store-level value…'
    }
    if (storeFallbackMode === null) {
        return 'No store-level override set. Falls back to: Dry run (default).'
    }
    return `Falls back to: ${FALLBACK_MODE_LABEL[storeFallbackMode]} (store default).`
}

export const ExecutionModeSelect = ({
    name,
    showDefaultOption,
    storeFallbackMode,
    defaultOptionLabel = 'Use store default',
    defaultOptionDescription,
    ariaLabel = 'Execution mode',
}: Props) => {
    const resolvedDefaultDescription =
        defaultOptionDescription ?? buildFallbackDescription(storeFallbackMode)

    const { control } = useFormContext()

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => {
                const currentValue = field.value as ExecutionModeFieldValue
                const radioValue =
                    currentValue ?? (showDefaultOption ? DEFAULT_VALUE : '')

                const handleChange = (next: string) => {
                    if (next === DEFAULT_VALUE) {
                        field.onChange(null)
                    } else {
                        field.onChange(next)
                    }
                }

                return (
                    <RadioGroup
                        aria-label={ariaLabel}
                        value={radioValue}
                        onChange={handleChange}
                    >
                        <Box flexDirection="column" gap="sm" width="100%">
                            {showDefaultOption && (
                                <RadioCard
                                    value={DEFAULT_VALUE}
                                    title={defaultOptionLabel}
                                    description={resolvedDefaultDescription}
                                />
                            )}
                            {EXECUTION_MODE_OPTIONS.map((opt) => (
                                <RadioCard
                                    key={opt.value}
                                    value={opt.value}
                                    title={opt.label}
                                    description={opt.description}
                                />
                            ))}
                        </Box>
                    </RadioGroup>
                )
            }}
        />
    )
}
