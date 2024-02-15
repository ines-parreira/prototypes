import React, {useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'

import css from './EndNodeTypeSelect.less'

type EndNodeTypeSelectProps = {
    value: EndNodeType['data']['action']
    onChange: (value: EndNodeType['data']['action']) => void
}

export default function EndNodeTypeSelect({
    value,
    onChange,
}: EndNodeTypeSelectProps) {
    const endStepEnabled = useFlags()[FeatureFlagKey.FlowsStepsEnd]

    const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const options = useMemo<EndNodeType['data']['action'][]>(
        () =>
            endStepEnabled
                ? ['ask-for-feedback', 'create-ticket', 'end']
                : ['ask-for-feedback', 'create-ticket'],
        [endStepEnabled]
    )

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
                                            'mr-2'
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
