import React, {memo, useEffect, useState} from 'react'
import {ulid} from 'ulidx'
import debounce from 'lodash/debounce'
import classnames from 'classnames'

import {MAX_HEADER_LENGTH} from 'config'
import InputField from 'pages/common/forms/input/InputField'
import Errors from 'pages/common/forms/Errors'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import CheckBox from 'pages/common/forms/CheckBox'
import {hasUnicodeChars} from 'utils'

import {Parameter, OnChangeAction} from '../../../types'
import css from './Parameters.less'

type Props = {
    addLabel?: string
    path: string
    value: Parameter[]
    onChange: OnChangeAction
}

const DEBOUNCE_DURATION = 200

function Parameters({addLabel = 'Parameter', value, path, onChange}: Props) {
    // NOTE: Not every values comes with an ID
    // so we need to generate the missing ones
    if (!value.every((field) => field.id)) {
        onChange(
            path,
            value.map((field) => ({
                ...field,
                id: field.id || ulid(),
            }))
        )
    }

    const [hasDuplicates, setDuplicates] = useState<boolean>(
        checkDuplicates(value)
    )
    useEffect(() => {
        setDuplicates(checkDuplicates(value))
    }, [value])

    const [debouncedOnChange, setDebouncedOnchange] = useState<OnChangeAction>(
        () => debounce(onChange, DEBOUNCE_DURATION)
    )
    useEffect(() => {
        setDebouncedOnchange(() => debounce(onChange, DEBOUNCE_DURATION))
    }, [onChange])

    const onDelete = (index: number) => {
        onChange(path, [...value.slice(0, index), ...value.slice(index + 1)])
    }

    const onAdd = () => {
        onChange(path, [
            ...value,
            {
                id: ulid(),
                key: '',
                value: '',
                label: '',
                editable: false,
                mandatory: false,
            },
        ])
    }

    return (
        <div>
            {value.map((field, index) => {
                const indexedPath = path + `[${index}]`
                return (
                    <div
                        key={field.id || index}
                        className={`${css.formParamRow} ${css.squash}`}
                    >
                        <InputField
                            label={index === 0 ? 'Label' : undefined}
                            placeholder="Label"
                            defaultValue={field.label}
                            onChange={(value) =>
                                debouncedOnChange(`${indexedPath}.label`, value)
                            }
                        />
                        <InputField
                            label={index === 0 ? 'Key' : undefined}
                            placeholder="Key"
                            defaultValue={field.key}
                            error={validateHeaderName(field.key, path)}
                            isRequired
                            maxLength={MAX_HEADER_LENGTH}
                            onChange={(value) =>
                                debouncedOnChange(`${indexedPath}.key`, value)
                            }
                        />
                        <InputField
                            label={index === 0 ? 'Value' : undefined}
                            placeholder="Value"
                            defaultValue={field.value}
                            isRequired={path.includes('headers')}
                            onChange={(value) =>
                                debouncedOnChange(`${indexedPath}.value`, value)
                            }
                        />

                        <CheckBox
                            className={css.editableCheck}
                            labelClassName={classnames(css.verticalCheckbox, {
                                [css.withoutLabel]: index !== 0,
                            })}
                            isChecked={Boolean(field.editable)}
                            onClick={() => {
                                onChange(
                                    `${indexedPath}.editable`,
                                    !field.editable
                                )
                                onChange(`${indexedPath}.mandatory`, false)
                            }}
                        >
                            {index === 0 ? 'Editable' : undefined}
                        </CheckBox>
                        <CheckBox
                            className={css.mandatoryCheck}
                            isChecked={field.mandatory}
                            isDisabled={!field.editable}
                            labelClassName={classnames(css.verticalCheckbox, {
                                [css.withoutLabel]: index !== 0,
                            })}
                            onClick={() => {
                                onChange(
                                    `${indexedPath}.mandatory`,
                                    !field.mandatory
                                )
                            }}
                        >
                            {index === 0 ? 'Required' : undefined}
                        </CheckBox>

                        <Button
                            className={classnames(css.deleteButton, {
                                [css.withoutLabel]: index !== 0,
                            })}
                            fillStyle="ghost"
                            intent="destructive"
                            onClick={() => onDelete(index)}
                            data-testid={`delete-${index}`}
                        >
                            <ButtonIconLabel icon="close" />
                        </Button>
                    </div>
                )
            })}
            {hasDuplicates && (
                <Errors className={css.formParamError}>
                    Beware, you have duplicate keys, only one will be kept.
                </Errors>
            )}
            <Button intent="secondary" size="small" onClick={onAdd}>
                <ButtonIconLabel icon="add" />
                {addLabel}
            </Button>
        </div>
    )
}

export default memo(Parameters)

function validateHeaderName(value: string, path: string): string | undefined {
    if (path.includes('headers') && hasUnicodeChars(value)) {
        return "Header's name can't contain unicode characters."
    }
}

function checkDuplicates(params: Parameter[]): boolean {
    return params.some((paramA, indexA) =>
        params.some(
            (paramB, indexB) =>
                paramA.key && indexA !== indexB && paramA.key === paramB.key
        )
    )
}
