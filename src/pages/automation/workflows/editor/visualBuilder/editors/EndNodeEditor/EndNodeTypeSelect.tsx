import React, {useRef, useState} from 'react'
import classNames from 'classnames'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './EndNodeTypeSelect.less'

type EndNodeTypeSelectProps = {
    withWasThisHelpfulPrompt: boolean
    onChange: (withWasThisHelpfulPrompt: boolean) => void
}

export default function EndNodeTypeSelect({
    withWasThisHelpfulPrompt,
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
            label={
                withWasThisHelpfulPrompt ? 'Ask for feedback' : 'Create ticket'
            }
            prefix={
                <i className={classNames('material-icons', css.icon)}>
                    {withWasThisHelpfulPrompt
                        ? 'thumb_up_alt'
                        : 'confirmation_number'}
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
                        value={withWasThisHelpfulPrompt}
                    >
                        <DropdownBody>
                            <DropdownItem
                                option={{
                                    label: 'Create ticket',
                                    value: false,
                                }}
                                onClick={(value) => {
                                    onChange(value)
                                }}
                                shouldCloseOnSelect
                            >
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.icon,
                                        'mr-2'
                                    )}
                                >
                                    confirmation_number
                                </i>
                                Create ticket
                            </DropdownItem>
                            <DropdownItem
                                option={{
                                    label: 'Ask for feedback',
                                    value: true,
                                }}
                                onClick={(value) => {
                                    onChange(value)
                                }}
                                shouldCloseOnSelect
                            >
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.icon,
                                        'mr-2'
                                    )}
                                >
                                    thumb_up_alt
                                </i>
                                Ask for feedback
                            </DropdownItem>
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
