import { OverflowList } from '@gorgias/axiom'

import { CustomerInfoFieldItem } from './CustomerInfoFieldItem'
import type { FieldConfig, FieldRenderContext } from './types'

type Props = {
    fields: FieldConfig[]
    context: FieldRenderContext
}

export function CustomerInfoFieldList({ fields, context }: Props) {
    return (
        <OverflowList nonExpandedLineCount={6} gap="xxs">
            {fields.map((field) => (
                <CustomerInfoFieldItem
                    key={field.id}
                    field={field}
                    context={context}
                />
            ))}
        </OverflowList>
    )
}
