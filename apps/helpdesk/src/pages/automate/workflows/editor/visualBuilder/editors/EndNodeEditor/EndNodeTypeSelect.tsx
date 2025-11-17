import React, { useRef, useState } from 'react'

import classNames from 'classnames'

import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'
import type { EndNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './EndNodeTypeSelect.less'

type EndNodeTypeSelectProps = {
    options: EndNodeType['data']['action'][]
    value: EndNodeType['data']['action']
    onChange: (value: EndNodeType['data']['action']) => void
}

export default function EndNodeTypeSelect({
    options,
    value,
    onChange,
}: EndNodeTypeSelectProps) {
    const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    return (
        <SelectInputBox
            floating={floatingRef}
            onToggle={setIsTypeSelectOpen}
            ref={targetRef}
            label={endNodeActionLabelByAction[value]}
            prefix={
                <i className={classNames('material-icons', css.icon)}>
                    {endNodeActionIconByAction[value]}
                </i>
            }
            className={css.selectInputBox}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isTypeSelectOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={value}
                    >
                        <DropdownBody>
                            {options.map((option) => (
                                <DropdownItem
                                    key={option}
                                    option={{
                                        label: endNodeActionLabelByAction[
                                            option
                                        ],
                                        value: option,
                                    }}
                                    onClick={onChange}
                                    shouldCloseOnSelect
                                >
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.icon,
                                            'mr-2',
                                        )}
                                    >
                                        {endNodeActionIconByAction[option]}
                                    </i>
                                    {endNodeActionLabelByAction[option]}
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
