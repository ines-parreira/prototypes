import React, { useRef, useState } from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

type PrimaryReasonsProps = {
    reasons: string[]
    handlePrimaryReasonSelection: (primaryReason: string) => void
    currentReason: string | null
}
const PrimaryReasons = ({
    reasons,
    handlePrimaryReasonSelection,
    currentReason,
}: PrimaryReasonsProps) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isDropdownOpen, setDropdownOpen] = useState(false)

    return (
        <SelectInputBox
            ref={targetRef}
            floating={floatingRef}
            onToggle={setDropdownOpen}
            placeholder="Select reason..."
            label={currentReason}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        target={targetRef}
                        ref={floatingRef}
                        isOpen={isDropdownOpen}
                        onToggle={() => context!.onBlur()}
                        value={currentReason}
                        placement="bottom-end"
                    >
                        <DropdownBody>
                            {reasons.map((primaryReason, index) => {
                                return (
                                    <DropdownItem
                                        key={index}
                                        onClick={() => {
                                            handlePrimaryReasonSelection(
                                                primaryReason,
                                            )
                                        }}
                                        option={{
                                            label: primaryReason,
                                            value: primaryReason,
                                        }}
                                        shouldCloseOnSelect
                                    />
                                )
                            })}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default PrimaryReasons
