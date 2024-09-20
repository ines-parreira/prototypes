import React, {FC, useRef, useState} from 'react'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

type EmailItem = {email: string; id: number}

type Props = {
    /**
     * nextSelectedIds designates the next selected email integration ids list
     */
    onSelectionChange: (nextSelectedIds: number[]) => void
    /**
     * Selected email integration ids list
     */
    selectedIds: number[]
    /**
     * Email integration list to compute the dropdown items
     */
    emailItems: EmailItem[]
    hasError?: boolean
}

export const EmailIntegrationListSelection: FC<Props> = ({
    onSelectionChange,
    selectedIds,
    emailItems,
    hasError = false,
}) => {
    // refs to work with the selector component
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    // used to display the list of selected emails when the dropdown is closed
    const selectedEmailLabels = selectedIds
        .map((selectedId) =>
            emailItems.find((email) => email.id === selectedId)
        )
        .filter((input): input is EmailItem => Boolean(input))
        .map((selectedEmail) => selectedEmail.email)

    // handle the toggle action on a list item then send the resulting list
    const handleIdToggled = (id: number) => {
        if (selectedIds.includes(id)) {
            const nextSelectedIds = selectedIds.filter(
                (selectedId) => selectedId !== id
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
            label={selectedEmailLabels}
            onToggle={setIsDropdownOpened}
            placeholder="Select one or more email addresses"
            hasError={hasError}
            ref={targetRef}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isMultiple
                        isOpen={isDropdownOpened}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedIds}
                    >
                        <DropdownSearch autoFocus />
                        <DropdownBody>
                            {emailItems.map(({email, id}) => (
                                <DropdownItem
                                    key={id}
                                    option={{
                                        label: email,
                                        value: id,
                                    }}
                                    onClick={handleIdToggled}
                                >
                                    {email}
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
