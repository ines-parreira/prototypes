import React from 'react'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import IconButton from 'pages/common/components/button/IconButton'
import Button from '../button/Button'
import css from './Condition.less'

type Operator = {
    label: string
    key: string
}

export type ConditionProps = {
    label: string
    operators: Operator[]
    isFirst: boolean
    type: string
    children: React.ReactNode
    selectedOperatorValue?: string
    onOperatorSelect?: (key: string) => void
    onDelete?: () => void
}

export const Condition = ({
    label,
    operators,
    selectedOperatorValue,
    type,
    isFirst,
    children,
    onDelete,
    onOperatorSelect,
}: ConditionProps): JSX.Element => {
    const options = operators.map(({label, key}) => ({
        label,
        value: key,
    }))

    return (
        <div className={css.container}>
            {!isFirst && (
                <Button intent="destructive" className={css.type}>
                    {type.toUpperCase()}
                </Button>
            )}
            <div className={css.conditionLabel}>{label}</div>
            <SelectField
                showSelectedOption
                value={selectedOperatorValue}
                onChange={(key) => onOperatorSelect?.(key as string)}
                options={options}
            />

            {children}

            {onDelete && (
                <IconButton
                    fillStyle="ghost"
                    intent="destructive"
                    size="medium"
                    onClick={() => onDelete()}
                >
                    clear
                </IconButton>
            )}
        </div>
    )
}
