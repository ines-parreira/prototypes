import React, { FC, ReactNode, useRef, useState } from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
// oxlint-disable-next-line no-named-as-default
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
    SelectInputBoxContextState,
} from 'pages/common/forms/input/SelectInputBox'

export type EmailItem = {
    email: string
    id: number
    isDisabled?: boolean
    isDefault?: boolean
}

type Props = {
    onSelectionChange: (nextSelectedId: number) => void
    selectedId?: number
    emailItems: EmailItem[]
    hasError?: boolean
    error?: string | ReactNode
    isDisabled?: boolean
    labelId?: string
}

export const HandoverEmailDropdown: FC<Props> = ({
    onSelectionChange,
    selectedId,
    emailItems,
    hasError = false,
    error,
    isDisabled,
    labelId,
}) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    const handleIdToggled = (
        id: number,
        context: SelectInputBoxContextState | null,
    ) => {
        onSelectionChange(id)

        context!.onBlur()
    }

    return (
        <SelectInputBox
            floating={floatingRef}
            label={emailItems.find(({ id }) => id === selectedId)?.email}
            onToggle={setIsDropdownOpened}
            placeholder="Select an email address"
            hasError={hasError}
            error={error}
            aria-labelledby={labelId}
            ref={targetRef}
            isDisabled={isDisabled}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isMultiple={false}
                        isOpen={isDropdownOpened}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedId}
                    >
                        <DropdownSearch autoFocus withClearText />
                        <DropdownBody>
                            {emailItems.map(({ email, id, isDisabled }) => (
                                <DropdownItem
                                    key={id}
                                    option={{
                                        label: email,
                                        value: id,
                                    }}
                                    onClick={(id) =>
                                        handleIdToggled(id, context)
                                    }
                                    isDisabled={isDisabled}
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
