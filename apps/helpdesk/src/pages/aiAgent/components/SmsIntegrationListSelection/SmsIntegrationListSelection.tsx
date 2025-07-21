import React, { ReactNode, useRef, useState } from 'react'

import { SmsIntegration } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './SmsIntegrationListSelection.less'

export type SmsItem = { name: string; id: string }

type SmsIntegrationListSelectionProps = {
    /**
     * nextSelectedIds designates the next selected sms integration ids list
     */
    onSelectionChange: (nextSelectedIds: number[]) => void
    /**
     * Selected sms integration ids list
     */
    selectedIds: number[]
    /**
     * SMS integration list to compute the dropdown items
     */
    smsItems: SmsIntegration[]
    /* id of connected label tag  */
    hasError?: boolean
    error?: string | ReactNode
    isDisabled?: boolean
    labelId?: string
    sortingCallback?: (a: SmsIntegration, b: SmsIntegration) => number
}

export const SmsIntegrationListSelection = ({
    onSelectionChange,
    selectedIds,
    smsItems,
    hasError = false,
    error,
    isDisabled,
    labelId,
    sortingCallback = undefined,
}: SmsIntegrationListSelectionProps) => {
    // refs to work with the selector component
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    if (sortingCallback !== undefined) {
        smsItems.sort(sortingCallback)
    }

    // used to display the list of selected sms when the dropdown is closed
    const selectedSmsLabels = selectedIds
        .map((selectedId) => smsItems.find((sms) => sms.id === selectedId))
        .filter((input): input is SmsIntegration => Boolean(input))
        .map((selectedSms) => selectedSms.name)

    // handle the toggle action on a list item then send the resulting list
    const handleIdToggled = (id: number) => {
        if (selectedIds.includes(id)) {
            const nextSelectedIds = selectedIds.filter(
                (selectedId) => selectedId !== id,
            )

            onSelectionChange(nextSelectedIds)
        } else {
            const nextSelectedIds = [...selectedIds, id]
            onSelectionChange(nextSelectedIds)
        }
    }

    return (
        <SelectInputBox
            floating={floatingRef}
            label={selectedSmsLabels}
            onToggle={setIsDropdownOpened}
            placeholder="Select one or more SMS integrations"
            hasError={hasError}
            error={error}
            ref={targetRef}
            aria-expanded={isDropdownOpened}
            aria-controls="sms-integrations-list"
            isDisabled={isDisabled}
            aria-labelledby={labelId}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        overlayClassName={css.dropdownOverlay}
                        id="sms-integrations-list"
                        isMultiple
                        isOpen={isDropdownOpened}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedIds}
                    >
                        <DropdownSearch autoFocus withClearText />
                        <DropdownBody>
                            {smsItems.map(({ id, name }) => (
                                <DropdownItem
                                    key={id}
                                    option={{ label: name, value: id }}
                                    onClick={handleIdToggled}
                                >
                                    {name}
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
