import React from 'react'

import cn from 'classnames'

import { Label } from '@gorgias/axiom'

import css from './FieldRow.less'

export type FieldRowProps = {
    fieldId?: string
    label: React.ReactNode
    children: React.ReactNode
    isRequired?: boolean
    className?: string
}

export const FieldRow = ({
    fieldId,
    label,
    children,
    isRequired = false,
    className,
}: FieldRowProps) => {
    return (
        <div className={cn(css.row, className)}>
            {label ? (
                <Label
                    size="md"
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
