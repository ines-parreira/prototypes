import React, {memo, useCallback} from 'react'
import {Button} from 'reactstrap'

import Tooltip from '../../../../../../../../../Tooltip'
import InputField from '../../../../../../../../../../forms/InputField.js'
import {MAX_HEADER_LENGTH} from '../../../../../../../../../../../../config'
import {hasUnicodeChars} from '../../../../../../../../../../../../utils'

import {Parameter, OnChangeAction} from '../../../types'

import css from '../../ActionButtons.less'

type Props = {
    path: string
    value: Parameter[]
    onChange: OnChangeAction
}

const generateBaseId = (path: string, index: number) =>
    `action-button-${path.replace(/[./]/g, '-')}-${index}`

function Parameters({value, path, onChange}: Props) {
    const validateHeaderName = useCallback(
        (value: string): string | undefined => {
            if (path.includes('headers') && hasUnicodeChars(value)) {
                return "Header's name can't contain unicode characters."
            }
        },
        [path]
    )

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
                        <div className={css.formParamCol}>
                            <InputField
                                type="text"
                                placeholder="Key"
                                value={field.key}
                                error={validateHeaderName(field.key)}
                                required
                                maxLength={MAX_HEADER_LENGTH}
                                onChange={(value) =>
                                    onChange(`${indexedPath}.key`, value)
                                }
                            />
                        </div>
                        <div className={css.formParamCol}>
                            <InputField
                                type="text"
                                placeholder="Value"
                                value={field.value}
                                required={path.includes('headers')}
                                onChange={(value) =>
                                    onChange(`${indexedPath}.value`, value)
                                }
                            />
                        </div>
                        <div className={css.formParamCol}>
                            <InputField
                                type="text"
                                placeholder="Edit Label"
                                value={field.label}
                                onChange={(value) =>
                                    onChange(`${indexedPath}.label`, value)
                                }
                            />
                        </div>
                        <div
                            className={`${css.formParamCol} ${css.formParamGroupIcon}`}
                        >
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
            <Button size="sm" onClick={onAdd}>
                <i className={`material-icons ${css.formParamIcon}`}>add</i>
            </Button>
        </div>
    )
}

export default memo(Parameters)
