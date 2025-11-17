import { memo } from 'react'

import classnames from 'classnames'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import { MAX_HEADER_LENGTH } from 'config'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import type {
    OnChangeAction,
    Parameter,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import { ParameterTypes } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TextArea from 'pages/common/forms/TextArea'

import { validateDropdownValues, validateHeaderName } from './validators'

import css from './Parameter.less'

type Props = {
    parameter: Parameter
    path: string
    index: number
    onChange: OnChangeAction
    debouncedOnChange: OnChangeAction
    onDelete: (index: number) => void
}

function ParameterComponent({
    parameter,
    path,
    index,
    onChange,
    debouncedOnChange,
    onDelete,
}: Props) {
    const indexedPath = path + `[${index}]`
    const dropdownValuesError =
        parameter.type === ParameterTypes.Dropdown
            ? validateDropdownValues(parameter.value)
            : undefined
    const idPrefix = `custom-action-${path}-`
    return (
        <div
            key={parameter.id || index}
            className={classnames(css.formParamRow, {
                [css.dropdownFormParamRow]:
                    parameter.type === ParameterTypes.Dropdown,
            })}
        >
            <div className={css.typeSelect}>
                {index === 0 && (
                    <Label
                        htmlFor={`${indexedPath}-param-type`}
                        className={css.label}
                    >
                        Type
                    </Label>
                )}
                <SelectField
                    id={index === 0 ? `${indexedPath}-param-type` : undefined}
                    showSelectedOption
                    value={parameter.type || ParameterTypes.Text}
                    onChange={(value) => {
                        onChange(`${indexedPath}.type`, value)
                    }}
                    options={Object.entries(ParameterTypes).map(
                        ([label, key]) => ({
                            value: key,
                            label: label,
                        }),
                    )}
                />
            </div>
            <InputField
                label={index === 0 ? 'Label' : undefined}
                placeholder="Label"
                defaultValue={parameter.label}
                onChange={(value) =>
                    debouncedOnChange(`${indexedPath}.label`, value)
                }
            />
            <InputField
                label={index === 0 ? 'Key' : undefined}
                placeholder="Key"
                defaultValue={parameter.key}
                error={validateHeaderName(parameter.key, path)}
                isRequired
                maxLength={MAX_HEADER_LENGTH}
                onChange={(value) =>
                    debouncedOnChange(`${indexedPath}.key`, value)
                }
            />
            {parameter.type === ParameterTypes.Dropdown ? (
                <TextArea
                    label={index === 0 ? 'Value' : undefined}
                    innerClassName={classnames(css.textArea, {
                        [css.hasLabel]: index === 0,
                    })}
                    caption={
                        dropdownValuesError
                            ? undefined
                            : 'Max 10 values separated by semicolons'
                    }
                    className={css.valueInput}
                    defaultValue={parameter.value}
                    isRequired={path.includes('headers')}
                    error={dropdownValuesError}
                    rows={1}
                    placeholder="e.g. Value 1; Value 2; Value 3"
                    autoRowHeight
                    onChange={(value) =>
                        debouncedOnChange(`${indexedPath}.value`, value)
                    }
                />
            ) : (
                <InputField
                    label={index === 0 ? 'Value' : undefined}
                    className={css.valueInput}
                    placeholder="Value"
                    defaultValue={parameter.value}
                    isRequired={path.includes('headers')}
                    onChange={(value) =>
                        debouncedOnChange(`${indexedPath}.value`, value)
                    }
                />
            )}
            <div className={classnames(css.checkboxWrapper, css.editableCheck)}>
                {index === 0 && (
                    <Label className={css.label} id={idPrefix + 'edit-check'}>
                        Editable
                    </Label>
                )}
                <CheckBox
                    aria-labelledby={idPrefix + 'edit-check'}
                    isChecked={
                        Boolean(parameter.editable) ||
                        parameter.type === ParameterTypes.Dropdown
                    }
                    isDisabled={parameter.type === ParameterTypes.Dropdown}
                    onClick={() => {
                        onChange(`${indexedPath}.editable`, !parameter.editable)
                        onChange(`${indexedPath}.mandatory`, false)
                    }}
                />
            </div>
            <div
                className={classnames(css.checkboxWrapper, css.mandatoryCheck)}
            >
                {index === 0 && (
                    <Label
                        className={css.label}
                        id={idPrefix + 'required-check'}
                    >
                        Required
                    </Label>
                )}
                <CheckBox
                    aria-labelledby={idPrefix + 'required-check'}
                    isChecked={parameter.mandatory}
                    isDisabled={
                        !(parameter.type === ParameterTypes.Dropdown) &&
                        !parameter.editable
                    }
                    onClick={() => {
                        onChange(
                            `${indexedPath}.mandatory`,
                            !parameter.mandatory,
                        )
                    }}
                />
            </div>

            <Button
                className={classnames(css.deleteButton, {
                    [css.withoutLabel]: index !== 0,
                })}
                fillStyle="ghost"
                intent="destructive"
                onClick={() => onDelete(index)}
            >
                <ButtonIconLabel icon="close" />
            </Button>
        </div>
    )
}

export default memo(ParameterComponent)
