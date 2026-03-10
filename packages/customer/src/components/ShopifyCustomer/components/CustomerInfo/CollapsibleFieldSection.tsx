import { useState } from 'react'

import { Box, Button, Text } from '@gorgias/axiom'

import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import type { FieldConfig, FieldRenderContext } from './types'

type Props = {
    label: string
    fields: FieldConfig[]
    context: FieldRenderContext
    defaultExpanded?: boolean
}

export function CollapsibleFieldSection({
    label,
    fields,
    context,
    defaultExpanded = true,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <Box flexDirection="column">
            <Box
                justifyContent="space-between"
                alignItems="center"
                paddingTop="sm"
                paddingBottom="sm"
            >
                <Text variant="bold">{label}</Text>
                <Button
                    variant="tertiary"
                    icon={
                        isExpanded ? 'arrow-chevron-up' : 'arrow-chevron-down'
                    }
                    aria-label={
                        isExpanded ? `Collapse ${label}` : `Expand ${label}`
                    }
                    onClick={() => setIsExpanded((v) => !v)}
                />
            </Box>
            {isExpanded && (
                <CustomerInfoFieldList fields={fields} context={context} />
            )}
        </Box>
    )
}
