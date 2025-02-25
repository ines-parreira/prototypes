import React, { PropsWithChildren, useRef, useState } from 'react'

import classnames from 'classnames'

import { Label } from '@gorgias/merchant-ui-kit'

import { BigCommerceProductSwatchModifier } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { FieldProps } from './types'

import css from './ModifierSwatch.less'
import sharedCss from './Shared.less'

const ColorLabelContainer = ({ children }: PropsWithChildren<unknown>) => (
    <div className={css.colorLabelContainer}>{children}</div>
)

const ColorLabel = ({
    valueData,
    label,
}: {
    valueData: BigCommerceProductSwatchModifier['option_values'][number]['value_data']
    label: string
}) => {
    if ('image_url' in valueData) {
        return (
            <ColorLabelContainer>
                <div className={css.imageContainer}>
                    <img
                        src={valueData.image_url}
                        alt={label}
                        className={css.image}
                    />
                </div>
                <span>{label}</span>
            </ColorLabelContainer>
        )
    }

    if (valueData.colors.length === 1) {
        return (
            <ColorLabelContainer>
                <div
                    className={css.color}
                    style={{ backgroundColor: valueData.colors[0] }}
                />
                <span>{label}</span>
            </ColorLabelContainer>
        )
    }

    if (valueData.colors.length === 2) {
        return (
            <ColorLabelContainer>
                <div className={css.color}>
                    <div
                        className={classnames(css.twoColor, css.extraColors)}
                        style={{ backgroundColor: valueData.colors[0] }}
                    />
                    <div
                        className={classnames(css.twoColor, css.extraColors)}
                        style={{ backgroundColor: valueData.colors[1] }}
                    />
                </div>
                <span>{label}</span>
            </ColorLabelContainer>
        )
    }

    if (valueData.colors.length === 3) {
        return (
            <ColorLabelContainer>
                <div className={css.color}>
                    <div
                        className={classnames(css.threeColor, css.extraColors)}
                        style={{ backgroundColor: valueData.colors[0] }}
                    />
                    <div
                        className={classnames(css.threeColor, css.extraColors)}
                        style={{ backgroundColor: valueData.colors[1] }}
                    />
                    <div
                        className={classnames(css.threeColor, css.extraColors)}
                        style={{ backgroundColor: valueData.colors[2] }}
                    />
                </div>
                <span>{label}</span>
            </ColorLabelContainer>
        )
    }

    return null
}

export const ModifierSwatch = ({
    modifier,
    value,
    error,
    onSetValue,
}: FieldProps<BigCommerceProductSwatchModifier>) => {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)

    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const label = modifier.option_values.find(({ id }) => id === value)?.label
    const hasError = Boolean(error)

    return (
        <div className={sharedCss.inputContainer}>
            <Label isRequired={modifier.required} className={sharedCss.label}>
                {modifier.display_name}
            </Label>
            <SelectInputBox
                ref={selectRef}
                floating={floatingSelectRef}
                onToggle={setIsSelectOpen}
                label={label}
                hasError={hasError}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            target={selectRef}
                            ref={floatingSelectRef}
                            isOpen={isSelectOpen}
                            onToggle={() => context!.onBlur()}
                            contained
                        >
                            <DropdownBody>
                                {modifier.option_values.map((optionValue) => (
                                    <DropdownItem
                                        key={optionValue.id}
                                        autoFocus
                                        shouldCloseOnSelect
                                        option={{
                                            label: optionValue.label,
                                            value: optionValue.id,
                                        }}
                                        onClick={() =>
                                            onSetValue(
                                                modifier.id,
                                                optionValue.id,
                                            )
                                        }
                                    >
                                        <ColorLabel
                                            valueData={optionValue.value_data}
                                            label={optionValue.label}
                                        />
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            {hasError ? (
                <p className={classnames(sharedCss.error)}>{error}</p>
            ) : null}
        </div>
    )
}
