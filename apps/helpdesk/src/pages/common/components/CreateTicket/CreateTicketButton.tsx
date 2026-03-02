import type { ReactElement } from 'react'
import { useRef } from 'react'

import { useConditionalShortcuts } from '@repo/utils'
import type { LocationDescriptor } from 'history'
import _noop from 'lodash/noop'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonIntent as ButtonIntent } from '@gorgias/axiom'

import DropdownButton from 'pages/common/components/button/DropdownButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import { useCreateTicketButton } from './useCreateTicketButton'

type CreateTicketButtonProps = {
    buttonProps?: {
        intent?: ButtonIntent
    }
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
    to,
    shouldBindKeys = false,
}: CreateTicketButtonProps) {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const {
        hasDraft,
        onResumeDraft,
        onDiscardDraft,
        createTicketActions,
        createTicketPath,
    } = useCreateTicketButton()

    useConditionalShortcuts(
        shouldBindKeys,
        'CreateTicketButton',
        createTicketActions,
    )

    if (!hasDraft) {
        return (
            <Link className="d-inline-flex" to={to ?? createTicketPath}>
                <Button {...buttonProps} isDisabled={isDisabled}>
                    Create ticket
                </Button>
            </Link>
        )
    }

    return (
        <>
            <DropdownButton
                intent={buttonProps?.intent ?? 'primary'}
                fillStyle="fill"
                onToggleClick={_noop}
                size="medium"
                ref={dropdownTargetRef}
            >
                Create ticket
            </DropdownButton>
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
                        onClick={() => onDiscardDraft(to ?? createTicketPath)}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </UncontrolledDropdown>
        </>
    )
}
