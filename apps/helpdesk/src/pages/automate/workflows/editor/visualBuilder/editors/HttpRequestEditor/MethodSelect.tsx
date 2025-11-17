import React, { useRef, useState } from 'react'

import type { HttpRequestNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from '../NodeEditor.less'

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

type Props = {
    isDisabled?: boolean
    value: HttpRequestNodeType['data']['method']
    onChange: (value: HttpRequestNodeType['data']['method']) => void
}

const MethodSelect = ({ value, onChange, isDisabled }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    return (
        <SelectInputBox
            isDisabled={isDisabled}
            floating={floatingRef}
            label={value}
            onToggle={setIsOpen}
            ref={targetRef}
            className={css.selectInput}
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
                            {methods.map((method) => (
                                <DropdownItem
                                    key={method}
                                    option={{
                                        label: method,
                                        value: method,
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
    )
}

export default MethodSelect
