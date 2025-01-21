import React, {useRef, useState} from 'react'

import {SUPPORTED_UI_DATA_TYPE_VALUES} from 'custom-fields/constants'
import {ExhaustiveUIDataType, SupportedUIDataType} from 'custom-fields/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './TypeSelectInput.less'

interface TypeSelectInputProps {
    value: ExhaustiveUIDataType
    onChange: (value: SupportedUIDataType) => void
    isDisabled?: boolean
}

export default function TypeSelectInput(props: TypeSelectInputProps) {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)

    const [isSelectOpen, setIsSelectOpen] = useState(false)

    return (
        <SelectInputBox
            ref={selectRef}
            floating={floatingSelectRef}
            onToggle={setIsSelectOpen}
            label={
                SUPPORTED_UI_DATA_TYPE_VALUES[
                    props.value as SupportedUIDataType
                ]?.name
            }
            isDisabled={props.isDisabled}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        target={selectRef}
                        ref={floatingSelectRef}
                        isOpen={isSelectOpen}
                        onToggle={() => context!.onBlur()}
                        value={props.value}
                    >
                        <DropdownBody>
                            {Object.entries(SUPPORTED_UI_DATA_TYPE_VALUES).map(
                                ([value, {icon, name, description}]) => (
                                    <DropdownItem
                                        key={value}
                                        option={{
                                            label: name,
                                            value: value as SupportedUIDataType,
                                        }}
                                        onClick={props.onChange}
                                        shouldCloseOnSelect
                                        autoFocus
                                    >
                                        <div className={css.option}>
                                            <div className={css.icon}>
                                                <i className="material-icons">
                                                    {icon}
                                                </i>
                                            </div>
                                            <div>
                                                <p className={css.name}>
                                                    {name}
                                                </p>
                                                <p className={css.description}>
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownItem>
                                )
                            )}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
