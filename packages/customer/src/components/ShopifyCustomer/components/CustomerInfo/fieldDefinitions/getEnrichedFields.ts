import type { ReactNode } from 'react'

type FieldDefinition<TContext> = {
    label: string
    getValue: (context: TContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: TContext,
    ) => ReactNode
}

type FieldEntry = {
    id: string
    visible: boolean
}

export function getEnrichedFields<TContext>(
    fields: FieldEntry[],
    fieldDefinitions: Record<string, FieldDefinition<TContext>>,
    context: TContext,
) {
    return fields
        .filter((f) => fieldDefinitions[f.id])
        .map((f) => {
            const def = fieldDefinitions[f.id]
            const rawValue = def.getValue(context)
            const displayValue = def.formatValue
                ? def.formatValue(rawValue, context)
                : String(rawValue ?? '-')

            return { ...f, label: def.label, displayValue }
        })
}
