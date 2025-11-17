import type { ReactNode } from 'react'
import React from 'react'

import FieldContainer from './FieldContainer'
import FieldLabel from './FieldLabel'
import FieldValue from './FieldValue'

import css from './StaticField.less'

type Props = {
    label?: ReactNode
    children: ReactNode
    isDisabled?: boolean
    isNotBold?: boolean
}

export default function StaticField({
    children,
    label,
    isDisabled = false,
    isNotBold = false,
}: Props) {
    return (
        <FieldContainer className={css.staticField}>
            {label && (
                <FieldLabel isDisabled={isDisabled}>{label}: </FieldLabel>
            )}
            <FieldValue isDisabled={isDisabled} isNotBold={isNotBold}>
                {children}
            </FieldValue>
        </FieldContainer>
    )
}
