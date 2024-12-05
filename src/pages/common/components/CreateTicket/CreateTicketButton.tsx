import {LocationDescriptor} from 'history'
import _noop from 'lodash/noop'
import React, {
    cloneElement,
    ComponentProps,
    ReactElement,
    useMemo,
    useRef,
} from 'react'
import {Link, useHistory} from 'react-router-dom'

import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import Button from 'pages/common/components/button/Button'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import useHandleTicketDraft from 'pages/common/components/CreateTicket/useHandleTicketDraft'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

type CreateTicketButtonProps = {
    buttonProps?: Omit<ComponentProps<typeof Button>, 'children'>
    isDisabled?: boolean
    to?: LocationDescriptor<{
        receiver: {
            name: string
            address: string
        }
    }>
    shouldBindKeys?: boolean
    trigger?: ReactElement
}
export default function CreateTicketButton({
    buttonProps,
    isDisabled,
    to = '/app/ticket/new',
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
        <Link className="d-inline-flex" to={to}>
            {trigger || (
                <Button {...buttonProps} isDisabled={isDisabled}>
                    Create ticket
                </Button>
            )}
        </Link>
    ) : (
        <>
            {trigger ? (
                cloneElement(trigger, {ref: dropdownTargetRef})
            ) : (
                <DropdownButton
                    intent={buttonProps?.intent ?? 'primary'}
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
                        onClick={() => onDiscardDraft(to)}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </UncontrolledDropdown>
        </>
    )
}
