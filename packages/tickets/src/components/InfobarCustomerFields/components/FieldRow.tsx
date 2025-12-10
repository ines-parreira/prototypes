import React from 'react'

import { Label } from './Label'

import css from './FieldRow.less'

export type FieldRowProps = {
    label: React.ReactNode
    children: React.ReactNode
}

export const FieldRow = ({ label, children }: FieldRowProps) => {
    return (
        <div className={css.row}>
            {label ? <Label>{label}</Label> : <div />}
            {children}
        </div>
    )
}
