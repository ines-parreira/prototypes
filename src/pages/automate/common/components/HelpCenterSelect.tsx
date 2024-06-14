import React, {useRef, useState} from 'react'

import SelectInputBox, {
    SelectInputBoxContext,
} from '../../../common/forms/input/SelectInputBox'
import Dropdown from '../../../common/components/dropdown/Dropdown'
import DropdownBody from '../../../common/components/dropdown/DropdownBody'
import DropdownItem from '../../../common/components/dropdown/DropdownItem'
import {HelpCenter} from '../../../../models/helpCenter/types'

export const EMPTY_HELP_CENTER_ID = -1

type Props = {
    helpCenter: HelpCenter | undefined
    helpCenters: HelpCenter[]
    withEmptyItemSelection?: boolean
    setHelpCenterId: (id: number) => void
}

const HelpCenterSelect = ({
    helpCenter,
    helpCenters,
    withEmptyItemSelection,
    setHelpCenterId,
}: Props) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [selectorOpen, setSelectorOpen] = useState(false)

    return (
        <SelectInputBox
            floating={floatingRef}
            label={helpCenter?.name}
            onToggle={setSelectorOpen}
            placeholder="Select a Help Center"
            ref={targetRef}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={selectorOpen}
                        onToggle={() => context!.onBlur()}
                        value={helpCenter?.id}
                        target={targetRef}
                        ref={floatingRef}
                        isDisabled={!helpCenters.length}
                    >
                        <DropdownBody>
                            {withEmptyItemSelection && (
                                <DropdownItem
                                    option={{
                                        label: 'No Help Center',
                                        value: EMPTY_HELP_CENTER_ID,
                                    }}
                                    onClick={setHelpCenterId}
                                    shouldCloseOnSelect
                                />
                            )}

                            {helpCenters.map((helpCenter) => (
                                <DropdownItem
                                    key={helpCenter.id}
                                    option={{
                                        label: helpCenter.name,
                                        value: helpCenter.id,
                                    }}
                                    onClick={setHelpCenterId}
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

export default HelpCenterSelect
