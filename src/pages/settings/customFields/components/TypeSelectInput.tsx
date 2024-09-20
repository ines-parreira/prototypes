import React, {useRef, useState} from 'react'

import {VALUE_TYPES} from 'models/customField/constants'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './TypeSelectInput.less'

const TYPE_TO_LABEL: Record<string, string> = VALUE_TYPES.reduce(
    (ret, type) => ({...ret, [type.value]: type.name}),
    {}
)

interface TypeSelectInputProps {
    value: string
    onChange: (value: string) => void
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
            label={TYPE_TO_LABEL[props.value]}
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
                            {VALUE_TYPES.map((type) => (
                                <DropdownItem
                                    key={type.value}
                                    option={{
                                        label: type.name,
                                        value: type.value,
                                    }}
                                    onClick={props.onChange}
                                    shouldCloseOnSelect
                                    autoFocus
                                >
                                    <div className={css.option}>
                                        <div className={css.icon}>
                                            <i className="material-icons">
                                                {type.icon}
                                            </i>
                                        </div>
                                        <div>
                                            <p className={css.name}>
                                                {type.name}
                                            </p>
                                            <p className={css.description}>
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
