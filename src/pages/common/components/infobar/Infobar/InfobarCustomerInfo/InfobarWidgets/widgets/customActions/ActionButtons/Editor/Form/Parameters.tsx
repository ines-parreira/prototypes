import React, {memo, useEffect, useState} from 'react'
import {Button} from 'reactstrap'
import debounce from 'lodash/debounce'

import {MAX_HEADER_LENGTH} from 'config'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import Tooltip from 'pages/common/components/Tooltip'
import Errors from 'pages/common/forms/Errors'
import {hasUnicodeChars} from 'utils'

import {Parameter, OnChangeAction} from '../../../types'

import css from '../../ActionButtons.less'

type Props = {
    path: string
    value: Parameter[]
    onChange: OnChangeAction
}

const DEBOUNCE_DURATION = 200

const generateBaseId = (path: string, index: number) =>
    `action-button-${path.replace(/[./]/g, '-')}-${index}`

function Parameters({value, path, onChange}: Props) {
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
            {key: '', value: '', label: '', editable: false, mandatory: false},
        ])
    }

    return (
        <div>
            {value.map((field, index) => {
                const indexedPath = path + `[${index}]`
                return (
                    <div
                        key={index}
                        className={`${css.formParamRow} ${css.squash}`}
                    >
                        <div>
                            <DEPRECATED_InputField
                                type="text"
                                placeholder="Key"
                                defaultValue={field.key}
                                error={validateHeaderName(field.key, path)}
                                required
                                maxLength={MAX_HEADER_LENGTH}
                                onChange={(value) =>
                                    debouncedOnChange(
                                        `${indexedPath}.key`,
                                        value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <DEPRECATED_InputField
                                type="text"
                                placeholder="Value"
                                defaultValue={field.value}
                                required={path.includes('headers')}
                                onChange={(value) =>
                                    debouncedOnChange(
                                        `${indexedPath}.value`,
                                        value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <DEPRECATED_InputField
                                type="text"
                                placeholder="Edit Label"
                                defaultValue={field.label}
                                onChange={(value) =>
                                    debouncedOnChange(
                                        `${indexedPath}.label`,
                                        value
                                    )
                                }
                            />
                        </div>
                        <div className={css.formParamGroupIcon}>
                            <Button
                                type="button"
                                size="sm"
                                id={generateBaseId(path, index) + 'editable'}
                                className="mr-2"
                                color={field.editable ? 'primary' : 'secondary'}
                                onClick={() => {
                                    onChange(
                                        `${indexedPath}.editable`,
                                        !field.editable
                                    )
                                }}
                            >
                                <i
                                    className={`material-icons ${css.formParamIcon}`}
                                >
                                    edit
                                </i>
                            </Button>
                            <Tooltip
                                placement="top"
                                target={
                                    generateBaseId(path, index) + 'editable'
                                }
                            >
                                {field.editable
                                    ? 'Click to make this field not editable'
                                    : 'Click to make this field editable'}
                            </Tooltip>

                            <Button
                                type="button"
                                size="sm"
                                id={generateBaseId(path, index) + 'mandatory'}
                                className="mr-2"
                                color={
                                    field.editable && field.mandatory
                                        ? 'primary'
                                        : 'secondary'
                                }
                                disabled={!field.editable}
                                onClick={() => {
                                    onChange(
                                        `${indexedPath}.mandatory`,
                                        !field.mandatory
                                    )
                                }}
                            >
                                <i
                                    className={`icon-custom icon-asterisk ${css.formParamCustomIcon}`}
                                >
                                    <span>mandatory</span>
                                </i>
                            </Button>
                            {field.editable && (
                                <Tooltip
                                    placement="top"
                                    target={
                                        generateBaseId(path, index) +
                                        'mandatory'
                                    }
                                >
                                    {field.mandatory
                                        ? 'Click to make this field not mandatory'
                                        : 'Click to make this field mandatory'}
                                </Tooltip>
                            )}

                            <Button
                                type="button"
                                size="sm"
                                onClick={() => onDelete(index)}
                            >
                                <i
                                    className={`material-icons text-danger ${css.formParamIcon}`}
                                >
                                    delete
                                </i>
                            </Button>
                        </div>
                    </div>
                )
            })}
            {hasDuplicates && (
                <Errors className={css.formParamError}>
                    Beware, you have duplicate keys, only one will be kept.
                </Errors>
            )}
            <Button size="sm" onClick={onAdd}>
                <i className={`material-icons ${css.formParamIcon}`}>add</i>
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
