import {
    Box,
    Heading,
    Icon,
    ListItem,
    SelectField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type { MessageInstructionsVariant } from 'AIJourney/components/MessageGuidanceCard/types'

export const WEIGHTED_SELECTION = 'weighted'
export const CONTROL_SELECTION = 'control'

export type GuidanceVariantOption = {
    id: string
    label: string
}

export const buildGuidanceVariantOptions = (
    variants: MessageInstructionsVariant[],
    includeWeighted: boolean,
): GuidanceVariantOption[] => [
    ...(includeWeighted
        ? [{ id: WEIGHTED_SELECTION, label: 'Weighted (random by A/B split)' }]
        : []),
    { id: CONTROL_SELECTION, label: 'Control' },
    ...variants.map((variant, index) => ({
        id: variant.id,
        label: `Variant ${index + 1}`,
    })),
]

export const resolveGuidanceSelection = (
    selection: string,
    variants: MessageInstructionsVariant[],
    includeWeighted: boolean,
): string => {
    const options = buildGuidanceVariantOptions(variants, includeWeighted)
    return (
        options.find((option) => option.id === selection)?.id ?? options[0].id
    )
}

export const getGuidanceInstructionsForSelection = (
    selection: string,
    controlInstructions: string,
    variants: MessageInstructionsVariant[],
): string => {
    if (selection === CONTROL_SELECTION || selection === WEIGHTED_SELECTION) {
        return controlInstructions
    }
    return (
        variants.find((variant) => variant.id === selection)
            ?.message_instructions ?? controlInstructions
    )
}

type TestGuidanceVariantSelectProps = {
    variants: MessageInstructionsVariant[]
    value: string
    onChange: (value: string) => void
    includeWeighted?: boolean
    label?: string
    infoTooltip?: string
}

export const TestGuidanceVariantSelect = ({
    variants,
    value,
    onChange,
    includeWeighted = false,
    label = 'Message guidance',
    infoTooltip,
}: TestGuidanceVariantSelectProps) => {
    const options = buildGuidanceVariantOptions(variants, includeWeighted)
    const selectedItem =
        options.find((option) => option.id === value) ?? options[0]

    return (
        <Box flexDirection="column" gap="xs">
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <Heading size="sm">{label}</Heading>
                {infoTooltip && (
                    <span>
                        <Tooltip
                            delay={0}
                            trigger={
                                <Icon
                                    name="info"
                                    alt={`${label} information`}
                                />
                            }
                        >
                            <TooltipContent title={infoTooltip} />
                        </Tooltip>
                    </span>
                )}
            </Box>
            <SelectField
                aria-label={label}
                items={options}
                value={selectedItem}
                onChange={(option: GuidanceVariantOption) =>
                    onChange(option.id)
                }
            >
                {(option: GuidanceVariantOption) => (
                    <ListItem id={option.id} label={option.label} />
                )}
            </SelectField>
        </Box>
    )
}
