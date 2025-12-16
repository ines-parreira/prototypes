import type { Dispatch, SetStateAction } from 'react'

import { Box, Icon, RadioCard, RadioGroup, Text } from '@gorgias/axiom'
import type {
    MergeTicketsBody,
    Ticket,
    TicketsSearchListDataItem,
} from '@gorgias/helpdesk-types'

type MergeTicketModalFieldsSelectionTabProps = {
    finalTicket: MergeTicketsBody | null
    setFinalTicket: Dispatch<SetStateAction<MergeTicketsBody | null>>
    ticket: Ticket
    targetTicket: TicketsSearchListDataItem
}

const noSubjectFallback = 'No ticket subject'
const noCustomerNameFallback = 'No customer name'

const TicketValue = {
    CurrentTicket: 'current_ticket',
    TargetTicket: 'target_ticket',
} as const

export function MergeTicketModalFieldsSelectionTab({
    finalTicket,
    setFinalTicket,
    ticket,
    targetTicket,
}: MergeTicketModalFieldsSelectionTabProps) {
    const subjectsAreDifferent = ticket.subject !== targetTicket.subject
    const customersAreDifferent =
        ticket.customer?.id !== targetTicket.customer?.id
    const assigneesAreDifferent =
        ticket.assignee_user?.id !== targetTicket.assignee_user?.id
    const oneAssigneeIsEmpty =
        !ticket.assignee_user || !targetTicket.assignee_user
    const nothingIsDifferent =
        !subjectsAreDifferent &&
        !customersAreDifferent &&
        (!assigneesAreDifferent || oneAssigneeIsEmpty)

    const handleSubjectChange = (value: string) => {
        setFinalTicket({
            ...finalTicket,
            subject:
                value === TicketValue.CurrentTicket
                    ? (ticket.subject ?? undefined)
                    : (targetTicket.subject ?? undefined),
        })
    }

    const handleCustomerChange = (value: string) => {
        setFinalTicket({
            ...finalTicket,
            customer: {
                id:
                    value === TicketValue.CurrentTicket
                        ? ticket.customer?.id
                        : targetTicket.customer?.id,
            },
        })
    }

    const handleAssigneeChange = (value: string) => {
        setFinalTicket({
            ...finalTicket,
            assignee_user: {
                id:
                    value === TicketValue.CurrentTicket
                        ? ticket.assignee_user?.id
                        : targetTicket.assignee_user?.id,
            },
        })
    }

    if (nothingIsDifferent) {
        return (
            <Box
                width="100%"
                height="100%"
                minHeight="420px"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                gap="lg"
            >
                <Icon name="circle-check" color="purple" size="lg" />
                <Box
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    gap="xxxxs"
                >
                    <Text>
                        These tickets are similar so all fields will be set
                        automatically.
                    </Text>
                    <Text>Confirm the merge below and you’re all set!</Text>
                </Box>
            </Box>
        )
    }

    return (
        <Box
            minHeight="420px"
            gap="lg"
            width="100%"
            height="100%"
            flexDirection="column"
        >
            <Text>
                Select which field to keep for each property before merging the
                tickets.
            </Text>
            <Box width="100%" flexDirection="column" gap="md">
                {subjectsAreDifferent && (
                    <Box width="100%" flexDirection="column" gap="sm">
                        <RadioGroup
                            value={
                                finalTicket?.subject === ticket.subject
                                    ? TicketValue.CurrentTicket
                                    : TicketValue.TargetTicket
                            }
                            onChange={handleSubjectChange}
                        >
                            <RadioCard
                                value={TicketValue.CurrentTicket}
                                title="Subject"
                                description={
                                    ticket?.subject ?? noSubjectFallback
                                }
                            />
                            <RadioCard
                                value={TicketValue.TargetTicket}
                                title="Subject"
                                description={
                                    targetTicket?.subject ?? noSubjectFallback
                                }
                            />
                        </RadioGroup>
                    </Box>
                )}
                {customersAreDifferent && (
                    <Box width="100%" flexDirection="column" gap="sm">
                        <RadioGroup
                            value={
                                finalTicket?.customer?.id ===
                                ticket.customer?.id
                                    ? TicketValue.CurrentTicket
                                    : TicketValue.TargetTicket
                            }
                            onChange={handleCustomerChange}
                        >
                            <RadioCard
                                value={TicketValue.CurrentTicket}
                                title="Customer"
                                description={
                                    ticket?.customer?.name ??
                                    noCustomerNameFallback
                                }
                            />
                            <RadioCard
                                value={TicketValue.TargetTicket}
                                title="Customer"
                                description={
                                    targetTicket?.customer?.name ??
                                    noCustomerNameFallback
                                }
                            />
                        </RadioGroup>
                    </Box>
                )}
                {assigneesAreDifferent && !oneAssigneeIsEmpty && (
                    <Box width="100%" flexDirection="column" gap="sm">
                        <RadioGroup
                            value={
                                finalTicket?.assignee_user?.id ===
                                ticket.assignee_user?.id
                                    ? TicketValue.CurrentTicket
                                    : TicketValue.TargetTicket
                            }
                            onChange={handleAssigneeChange}
                        >
                            {ticket.assignee_user?.name && (
                                <RadioCard
                                    value={TicketValue.CurrentTicket}
                                    title="Assignee"
                                    description={ticket?.assignee_user?.name}
                                />
                            )}
                            {targetTicket.assignee_user?.name && (
                                <RadioCard
                                    value={TicketValue.TargetTicket}
                                    title="Assignee"
                                    description={
                                        targetTicket?.assignee_user?.name
                                    }
                                />
                            )}
                        </RadioGroup>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
