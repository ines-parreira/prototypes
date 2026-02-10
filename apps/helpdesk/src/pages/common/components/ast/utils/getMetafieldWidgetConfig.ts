import type { MetafieldType } from '@gorgias/helpdesk-types'

type WidgetConfig = {
    type: string
    options?: Array<{ value: string; label: string }>
}

const NUMERIC_METAFIELD_TYPES: MetafieldType[] = [
    'number_integer',
    'number_decimal',
    'rating',
    'dimension',
    'volume',
    'weight',
    'money',
]

const DATE_METAFIELD_TYPES: MetafieldType[] = ['date', 'date_time']

export function getMetafieldWidgetConfig(
    metafieldType: MetafieldType | undefined,
    __operatorName: string | undefined,
): WidgetConfig | null {
    if (!metafieldType) return null

    if (metafieldType === 'boolean') {
        return {
            type: 'select',
            options: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' },
            ],
        }
    }

    if (NUMERIC_METAFIELD_TYPES.includes(metafieldType)) {
        return { type: 'number-input' }
    }

    if (DATE_METAFIELD_TYPES.includes(metafieldType)) {
        return { type: 'datetime-select' }
    }

    return null
}
