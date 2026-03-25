import {
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Text,
} from '@gorgias/axiom'

import { CustomerInfoFieldList } from '../CustomerInfoFieldList'
import type { FieldConfig, FieldRenderContext } from '../types'

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
    defaultExpanded = false,
}: Props) {
    return (
        <Disclosure defaultExpanded={defaultExpanded}>
            <DisclosureHeader title={<Text variant="bold">{label}</Text>} />
            <DisclosurePanel>
                <CustomerInfoFieldList
                    fields={fields}
                    context={context}
                    showOverflowToggle={false}
                />
            </DisclosurePanel>
        </Disclosure>
    )
}
