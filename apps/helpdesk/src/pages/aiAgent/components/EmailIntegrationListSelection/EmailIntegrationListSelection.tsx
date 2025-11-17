import type { FC, ReactNode } from 'react'
import React, { useRef, useState } from 'react'

import { Badge } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './EmailIntegrationListSelection.less'

export type EmailItem = {
    email: string
    id: number
    isDisabled?: boolean
    isDefault?: boolean
}

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
    error?: string | ReactNode
    isDisabled?: boolean
    /* id of connected label tag  */
    labelId?: string
    /**
     * A flag to add a default badge if the item is the default one
     */
    withDefaultTag?: boolean
    sortingCallback?: (a: EmailItem, b: EmailItem) => number
}

export const EmailIntegrationListSelection: FC<Props> = ({
    onSelectionChange,
    selectedIds,
    emailItems,
    hasError = false,
    error,
    isDisabled,
    labelId,
    withDefaultTag = false,
    sortingCallback = undefined,
}) => {
    // refs to work with the selector component
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    if (sortingCallback !== undefined) emailItems.sort(sortingCallback)

    // used to display the list of selected emails when the dropdown is closed
    const selectedEmailLabels = selectedIds
        .map((selectedId) =>
            emailItems.find((email) => email.id === selectedId),
        )
        .filter((input): input is EmailItem => Boolean(input))
        .map((selectedEmail) => selectedEmail.email)

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
            label={selectedEmailLabels}
            onToggle={setIsDropdownOpened}
            placeholder="Select one or more email addresses"
            hasError={hasError}
            error={error}
            aria-labelledby={labelId}
            ref={targetRef}
            isDisabled={isDisabled}
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
                        <DropdownSearch autoFocus withClearText />
                        <DropdownBody>
                            {emailItems.map(
                                ({ email, id, isDefault, isDisabled }) => (
                                    <DropdownItem
                                        key={id}
                                        option={{
                                            label: email,
                                            value: id,
                                        }}
                                        onClick={handleIdToggled}
                                        isDisabled={isDisabled}
                                    >
                                        {withDefaultTag ? (
                                            <div
                                                className={
                                                    css['dropdown-container']
                                                }
                                            >
                                                {isDisabled ? (
                                                    <div
                                                        className={
                                                            css[
                                                                'label-container'
                                                            ]
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                css[
                                                                    'email-label'
                                                                ]
                                                            }
                                                        >
                                                            {email}
                                                        </div>
                                                        <span
                                                            className={
                                                                css[
                                                                    'used-email'
                                                                ]
                                                            }
                                                        >
                                                            Email already used
                                                            by AI Agent in
                                                            another store
                                                        </span>
                                                    </div>
                                                ) : (
                                                    email
                                                )}
                                                {isDefault && (
                                                    <div
                                                        className={
                                                            css[
                                                                'badge-container'
                                                            ]
                                                        }
                                                    >
                                                        <Badge type="blue">
                                                            Default
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            email
                                        )}
                                    </DropdownItem>
                                ),
                            )}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
