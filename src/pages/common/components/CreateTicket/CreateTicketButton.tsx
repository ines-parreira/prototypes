import React, {cloneElement, ReactElement, useRef} from 'react'
import _noop from 'lodash/noop'

import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import useHandleTicketDraft from 'pages/common/components/CreateTicket/useHandleTicketDraft'

type CreateTicketButtonProps = {
    trigger?: ReactElement
    isDisabled?: boolean
}
export default function CreateTicketButton({
    trigger,
    isDisabled,
}: CreateTicketButtonProps) {
    const {hasDraft, onResumeDraft, onDiscardDraft} = useHandleTicketDraft()
    const dropdownTargetRef = useRef<HTMLDivElement>(null)

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
