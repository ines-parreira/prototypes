import React, { memo, useCallback, useMemo } from 'react'

import debounce from 'lodash/debounce'
import { ulid } from 'ulidx'

import { Button } from '@gorgias/axiom'

import {
    OnChangeAction,
    Parameter as ParameterType,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import Caption from 'pages/common/forms/Caption/Caption'

import Parameter from './Parameter'
import { checkDuplicates } from './validators'

import css from './Parameters.less'

type Props = {
    addLabel?: string
    path: string
    value: ParameterType[]
    onChange: OnChangeAction
}

const DEBOUNCE_DURATION = 200

function Parameters({ addLabel = 'Parameter', value, path, onChange }: Props) {
    // NOTE: Not every values comes with an ID
    // so we need to generate the missing ones
    if (!value.every((field) => field.id)) {
        onChange(
            path,
            value.map((field) => ({
                ...field,
                id: field.id || ulid(),
            })),
        )
    }

    const debouncedOnChange = useMemo(
        () => debounce(onChange, DEBOUNCE_DURATION),
        [onChange],
    )

    const onDelete = useCallback(
        (index: number) => {
            onChange(path, [
                ...value.slice(0, index),
                ...value.slice(index + 1),
            ])
        },
        [onChange, path, value],
    )

    const onAdd = () => {
        onChange(path, [
            ...value,
            {
                id: ulid(),
                key: '',
                value: '',
                editable: false,
                mandatory: false,
            },
        ])
    }

    return (
        <div>
            {value.map((parameter, index) => (
                <Parameter
                    key={parameter.id || index}
                    parameter={parameter}
                    path={path}
                    index={index}
                    onChange={onChange}
                    debouncedOnChange={debouncedOnChange}
                    onDelete={onDelete}
                />
            ))}
            {checkDuplicates(value) && (
                <Caption
                    className={css.formParamError}
                    error=" Beware, you have duplicate keys, only one will be kept."
                />
            )}
            <Button
                intent="secondary"
                size="small"
                onClick={onAdd}
                leadingIcon="add"
            >
                Add {addLabel}
            </Button>
        </div>
    )
}

export default memo(Parameters)
