import {Label} from '@gorgias/ui-kit'
import React, {useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import {AUTH_TYPE_LABEL_BY_TYPE} from '../constants'
import {ActionsApp} from '../types'

import css from './ActionsPlatformAuthTypeSelectBox.less'

type Props = {
    value: ActionsApp['auth_type']
    onChange: (value: ActionsApp['auth_type']) => void
    isDisabled?: boolean
}

const ActionsPlatformAuthTypeSelectBox = ({
    value,
    onChange,
    isDisabled,
}: Props) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={css.container}>
            <Label isRequired>Authentication method</Label>
            <SelectInputBox
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                isDisabled={isDisabled}
                label={AUTH_TYPE_LABEL_BY_TYPE[value]}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                        >
                            <DropdownBody>
                                {(
                                    Object.entries(AUTH_TYPE_LABEL_BY_TYPE) as [
                                        ActionsApp['auth_type'],
                                        string,
                                    ][]
                                ).map(([value, label]) => (
                                    <DropdownItem
                                        key={value}
                                        option={{
                                            value,
                                            label,
                                        }}
                                        onClick={onChange}
                                        shouldCloseOnSelect
                                    />
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default ActionsPlatformAuthTypeSelectBox
