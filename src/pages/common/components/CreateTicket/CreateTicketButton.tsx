import _noop from 'lodash/noop'
import React, {cloneElement, ReactElement, useMemo, useRef} from 'react'
import {Link, useHistory} from 'react-router-dom'

import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import Button from 'pages/common/components/button/Button'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import useHandleTicketDraft from 'pages/common/components/CreateTicket/useHandleTicketDraft'

type CreateTicketButtonProps = {
    isDisabled?: boolean
    shouldBindKeys?: boolean
    trigger?: ReactElement
}
export default function CreateTicketButton({
    isDisabled,
    shouldBindKeys = false,
    trigger,
}: CreateTicketButtonProps) {
    const history = useHistory()
    const {hasDraft, onResumeDraft, onDiscardDraft} = useHandleTicketDraft()
    const dropdownTargetRef = useRef<HTMLDivElement>(null)

    const actions = useMemo(
        () => ({
            CREATE_TICKET: {
                action: (e: Event) => {
                    e.preventDefault()
                    history.push('/app/ticket/new')
                },
            },
        }),
        [history]
    )

    useConditionalShortcuts(shouldBindKeys, 'CreateTicketButton', actions)

    return !hasDraft ? (
        <Link to="/app/ticket/new" className="d-inline-flex">
            {trigger || <Button isDisabled={isDisabled}>Create ticket</Button>}
        </Link>
    ) : (
        <>
            {trigger ? (
                cloneElement(trigger, {ref: dropdownTargetRef})
            ) : (
                <DropdownButton
                    color="primary"
                    fillStyle="fill"
                    onToggleClick={_noop}
                    size="medium"
                    ref={dropdownTargetRef}
                >
                    Create ticket
                </DropdownButton>
            )}
            <UncontrolledDropdown
                target={dropdownTargetRef}
                placement="bottom-end"
                isDisabled={isDisabled}
            >
                <DropdownBody>
                    <DropdownItem
                        option={{
                            label: 'Resume draft',
                            value: 'resume',
                        }}
                        onClick={onResumeDraft}
                        shouldCloseOnSelect
                    />

                    <DropdownItem
                        option={{
                            label: 'Discard and create new ticket',
                            value: 'discard',
                        }}
                        onClick={onDiscardDraft}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </UncontrolledDropdown>
        </>
    )
}
