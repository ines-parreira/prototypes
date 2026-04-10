import { Icon, TextField, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { AggregateDef, FieldDef } from '../../types/conditionField'

export const ConditionValueInput = ({
    fieldDef,
    value,
    onChange,
    isUnary,
    operator = '',
}: {
    fieldDef: FieldDef | AggregateDef
    field?: string
    value: string | number | null
    onChange: (val: string | number | null) => void
    isUnary: boolean
    operator?: string
}) => {
    if (isUnary) return null

    if (fieldDef.type === 'number') {
        return (
            <TextField
                aria-label="Value"
                inputMode="numeric"
                value={value !== null ? String(value) : ''}
                onChange={(val) => onChange(val ? Number(val) : null)}
                style={{ width: '120px' }}
            />
        )
    }

    const shouldRenderTooltip = operator.toLowerCase().includes('contains')

    return (
        <>
            <TextField
                aria-label="Value"
                placeholder="Enter value"
                value={(value as string) ?? ''}
                onChange={(value) => onChange(value || null)}
                style={{ width: '160px' }}
            />
            {shouldRenderTooltip && (
                <span>
                    <Tooltip delay={0} trigger={<Icon name="info" />}>
                        <TooltipContent title="Enter multiple values separated by a comma" />
                    </Tooltip>
                </span>
            )}
        </>
    )
}
