import React, {useRef, useState} from 'react'
import classNames from 'classnames'
import Tooltip from 'pages/common/components/Tooltip'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import css from './NodeMenuDropdown.less'

type NodeMenuDropdownProps = {
    options: Array<{
        content: React.ReactNode
        onSelect: () => void
        askConfirmation?: Maybe<boolean>
        confirmationTitle?: Maybe<string>
        confirmationText?: Maybe<string>
        onConfirmationAsk?: () => void
        onConfirmationCancel?: () => void
    }>
    isDisabled?: Maybe<boolean>
    disabledText?: Maybe<string>
}

export default function NodeMenuDropdown({
    options,
    isDisabled,
    disabledText,
}: NodeMenuDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const [isDrowpdownOpen, setIsDropdownOpen] = useState(false)
    const optionWithConfirmation = options.find(
        ({askConfirmation}) => askConfirmation
    )
    const tooltipRef = useRef<HTMLDivElement | null>(null)
    if (isDisabled) {
        return (
            <>
                <div
                    className={classNames(
                        css['threeDots'],
                        css['threeDotsDisabled']
                    )}
                    ref={tooltipRef}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    <i className="material-icons">more_vert</i>
                </div>
                <Tooltip
                    placement="top"
                    target={tooltipRef}
                    trigger={['hover']}
                >
                    {disabledText}
                </Tooltip>
            </>
        )
    }
    return (
        <>
            {/* due to a popover placement problem, the ConfirmationPopover wraps the whole dropdown instead of each item
                so there can be only one option asking for confirmation */}
            <ConfirmationPopover
                placement="top"
                buttonProps={{
                    intent: 'destructive',
                }}
                popperClassName={css.popover}
                title={optionWithConfirmation?.confirmationTitle}
                content={<>{optionWithConfirmation?.confirmationText}</>}
                onConfirm={() => {
                    optionWithConfirmation?.onSelect()
                }}
                onCancel={optionWithConfirmation?.onConfirmationCancel}
                cancelButtonProps={{intent: 'secondary'}}
                showCancelButton={true}
            >
                {({uid, onDisplayConfirmation}) => (
                    <>
                        <div
                            id={uid}
                            className={css['threeDots']}
                            onClick={(e) => {
                                setIsDropdownOpen(!isDrowpdownOpen)
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            ref={dropdownRef}
                        >
                            <i className="material-icons">more_vert</i>
                        </div>
                        <Dropdown
                            isOpen={isDrowpdownOpen}
                            onToggle={setIsDropdownOpen}
                            target={dropdownRef}
                        >
                            <DropdownBody>
                                {options.map(
                                    (
                                        {
                                            content,
                                            askConfirmation,
                                            onConfirmationAsk,
                                            onSelect,
                                        },
                                        i
                                    ) => (
                                        <DropdownItem
                                            key={i}
                                            option={{
                                                label: '',
                                                value: i.toString(),
                                            }}
                                            onClick={() => {
                                                if (askConfirmation) {
                                                    onConfirmationAsk?.()
                                                    onDisplayConfirmation()
                                                } else {
                                                    onSelect()
                                                }
                                            }}
                                            shouldCloseOnSelect
                                        >
                                            {content}
                                        </DropdownItem>
                                    )
                                )}
                            </DropdownBody>
                        </Dropdown>
                    </>
                )}
            </ConfirmationPopover>
        </>
    )
}
