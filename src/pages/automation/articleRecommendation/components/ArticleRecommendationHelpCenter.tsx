import React, {useRef, useState} from 'react'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {HelpCenter} from 'models/helpCenter/types'

interface Props {
    helpCenter: HelpCenter | undefined
    availableHelpCenters: HelpCenter[]
    setHelpCenterId: (id: number) => void
}

const ArticleRecommendationHelpCenter = ({
    helpCenter,
    availableHelpCenters,
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
            placeholder="Select Help Center"
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
                        isDisabled={!availableHelpCenters.length}
                    >
                        <DropdownBody>
                            {availableHelpCenters.map((helpCenter, index) => (
                                <DropdownItem
                                    key={helpCenter.id}
                                    option={{
                                        label: helpCenter.name,
                                        value: helpCenter.id,
                                    }}
                                    onClick={setHelpCenterId}
                                    shouldCloseOnSelect
                                    autoFocus={index === 0}
                                />
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default ArticleRecommendationHelpCenter
