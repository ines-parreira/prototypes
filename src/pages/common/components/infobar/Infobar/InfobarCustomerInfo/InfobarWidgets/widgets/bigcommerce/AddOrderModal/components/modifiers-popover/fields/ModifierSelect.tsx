import React, {useRef, useState} from 'react'

import classnames from 'classnames'

import {BigCommerceProductSelectModifier} from 'models/integration/types'
import Label from 'pages/common/forms/Label/Label'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import {FieldProps} from './types'
import sharedCss from './Shared.less'

export const ModifierSelect = ({
    modifier,
    value,
    error,
    onSetValue,
}: FieldProps<BigCommerceProductSelectModifier>) => {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)

    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const label = modifier.option_values.find(({id}) => id === value)?.label
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
                                <>
                                    {modifier.option_values.map(
                                        ({label, id}) => (
                                            <DropdownItem
                                                key={id}
                                                autoFocus
                                                shouldCloseOnSelect
                                                option={{
                                                    label: label,
                                                    value: id,
                                                }}
                                                onClick={() =>
                                                    onSetValue(modifier.id, id)
                                                }
                                            />
                                        )
                                    )}
                                </>
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
