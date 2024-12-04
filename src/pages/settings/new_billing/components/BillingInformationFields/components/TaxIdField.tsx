import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React from 'react'

import {FieldValues, Path} from 'react-hook-form'

import {
    FormInputField,
    IFormInputFieldProps,
} from 'pages/settings/new_billing/components/FormInputField/FormInputField'

import {TaxIdType} from 'state/billing/types'

import css from './TaxIdField.less'

type IProps<
    TFieldName extends Path<TFieldValues>,
    TFieldValues extends FieldValues,
> = {
    type: TaxIdType
    pattern: RegExp
    label: string
    tooltip: React.ReactNode
    instructions: string
} & Omit<
    IFormInputFieldProps<TFieldName, TFieldValues>,
    'type' | 'name' | 'transform' | 'rules' | 'label' | 'pattern' | 'caption'
>

export function TaxIdField<
    TFieldName extends Path<TFieldValues>,
    TFieldValues extends FieldValues,
>({
    type,
    pattern,
    label,
    tooltip,
    instructions,
    ...props
}: IProps<TFieldName, TFieldValues>) {
    return (
        <FormInputField
            type="text"
            name={type}
            caption={instructions}
            transform={(value) =>
                value.replace(/[^0-9a-zA-Z-]/g, '').toUpperCase()
            }
            rules={{
                required: instructions,
                pattern: {
                    value: pattern,
                    message: instructions,
                },
            }}
            label={
                <>
                    {label}
                    <i
                        id={`${type}-tooltip`}
                        className={classNames(
                            'material-icons-outlined',
                            css.tooltipIcon
                        )}
                    >
                        info
                    </i>
                    <Tooltip
                        target={`${type}-tooltip`}
                        placement="top-end"
                        className={css.tooltip}
                    >
                        {tooltip}
                    </Tooltip>
                </>
            }
            {...props}
        />
    )
}
