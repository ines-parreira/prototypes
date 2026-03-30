import { Box, Button, Text } from '@gorgias/axiom'

import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { CollapsibleFieldSection } from './editPanels/CollapsibleFieldSection'
import { resolveSectionFields } from './fieldDefinitions/resolveSectionFields'
import type { FieldConfig, FieldRenderContext } from './types'
import type { SectionFieldData } from './widget/customerFieldPreferences.utils'

import css from './editPanels/IntermediateEditPanel.less'

type CustomerMetricsSectionProps = {
    fields: FieldConfig[]
    context: FieldRenderContext
    onEditMetricsClick: () => void
    sections: SectionFieldData[]
}

export function CustomerMetricsSection({
    fields,
    context,
    onEditMetricsClick,
    sections,
}: CustomerMetricsSectionProps) {
    return (
        <div className={css.section}>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="sm"
            >
                <Text size="md" variant="bold">
                    Customer metrics
                </Text>
                <Button
                    size="sm"
                    variant="secondary"
                    leadingSlot="edit"
                    onClick={onEditMetricsClick}
                >
                    Edit metrics
                </Button>
            </Box>
            <CustomerInfoFieldList fields={fields} context={context} />
            <Box gap="sm" mt="sm" flexDirection="column">
                {sections.map((section) => {
                    const addresses = context.shopper?.data?.addresses ?? []
                    return resolveSectionFields(section, addresses).map(
                        (rs) => (
                            <CollapsibleFieldSection
                                key={rs.key}
                                label={rs.label}
                                fields={rs.fields}
                                context={context}
                            />
                        ),
                    )
                })}
            </Box>
        </div>
    )
}
