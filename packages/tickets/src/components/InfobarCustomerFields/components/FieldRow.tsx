import React from 'react'

import { Label } from '@gorgias/axiom'

import css from './FieldRow.less'

export type FieldRowProps = {
    fieldId?: string
    label: React.ReactNode
    children: React.ReactNode
    isRequired?: boolean
}

export const FieldRow = ({
    fieldId,
    label,
    children,
    isRequired = false,
}: FieldRowProps) => {
    return (
        <div className={css.row}>
            {label ? (
                <Label
                    size="sm"
                    overflow="ellipsis"
                    isRequired={isRequired}
                    htmlFor={fieldId}
                >
                    {label}
                </Label>
            ) : (
                <div />
            )}
            {children}
        </div>
    )
}
