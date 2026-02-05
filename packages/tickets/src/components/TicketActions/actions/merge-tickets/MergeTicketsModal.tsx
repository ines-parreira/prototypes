import { useCallback, useMemo, useState } from 'react'

import type { ValueOf } from '@repo/types'

import {
    Box,
    Button,
    CheckBoxField,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Stepper,
    StepperTabItem,
    StepperTabList,
    StepperTabPanel,
} from '@gorgias/axiom'
import type {
    MergeTicketsBody,
    Ticket,
    TicketsSearchListDataItem,
} from '@gorgias/helpdesk-types'

import { MergeTicketModalFieldsSelectionTab } from './MergeTicketModalFieldsSelectionTab'
import { MergeTicketsModalSearchTab } from './MergeTicketsModalSearchTab'
import { useMergeTickets } from './useMergeTickets'
import { useMergeTicketSearch } from './useMergeTicketSearch'
import { useMergeTicketsTable } from './useMergeTicketsTable'

import css from './MergeTicketsModal.less'

const MergeTicketsModalTabs = {
    Search: 'search',
    FieldsSelection: 'fields-selection',
} as const

type MergeTicketsModalProps = {
    ticket: Ticket
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function MergeTicketsModal({
    isOpen,
    onOpenChange,
    ticket,
}: MergeTicketsModalProps) {
    const [isConfirmationChecked, setIsConfirmationChecked] = useState(false)
    const [selectedTab, setSelectedTab] = useState<
        ValueOf<typeof MergeTicketsModalTabs>
    >(MergeTicketsModalTabs.Search)
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(
        null,
    )
    const [finalTicket, setFinalTicket] = useState<MergeTicketsBody | null>(
        null,
    )

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setSelectedTicketId(null)
            onOpenChange(open)
        },
        [onOpenChange],
    )

    const { tickets, isFetching, searchQuery, setSearchQuery } =
        useMergeTicketSearch(ticket)

    const { mergeTickets } = useMergeTickets(ticket.id)

    const handleRowClick = useCallback(
        (selectedTicket: TicketsSearchListDataItem) => {
            if (!selectedTicket.id) return

            let finalTicket: MergeTicketsBody = {}
            const subject = selectedTicket.subject ?? ticket.subject
            if (subject) {
                finalTicket.subject = subject
            }

            const customer = selectedTicket.customer?.id ?? ticket.customer?.id
            if (customer) {
                finalTicket.customer = {
                    id: customer,
                }
            }

            const assignee =
                selectedTicket.assignee_user?.id ?? ticket.assignee_user?.id
            if (assignee) {
                finalTicket.assignee_user = {
                    id: assignee,
                }
            }

            setFinalTicket(finalTicket)
            setSelectedTicketId(selectedTicket.id)
            setSelectedTab(MergeTicketsModalTabs.FieldsSelection)
        },
        [ticket.subject, ticket.customer?.id, ticket.assignee_user?.id],
    )

    const { table, columnCount } = useMergeTicketsTable({
        tickets: (tickets?.data.data as TicketsSearchListDataItem[]) ?? [],
    })

    const handleSearchQueryChange = useCallback(
        (query: string) => {
            setSearchQuery(query)
            table.resetRowSelection()
        },
        [table, setSearchQuery],
    )

    const handleMergeTicketsClick = useCallback(async () => {
        if (!finalTicket || !selectedTicketId) return

        await mergeTickets(finalTicket, {
            target_id: selectedTicketId,
            source_id: ticket.id,
        })
        handleOpenChange(false)
    }, [
        finalTicket,
        selectedTicketId,
        mergeTickets,
        ticket.id,
        handleOpenChange,
    ])

    const targetTicket = useMemo(
        () =>
            (tickets?.data.data as TicketsSearchListDataItem[])?.find(
                (ticket) => ticket.id === selectedTicketId,
            ),
        [tickets?.data.data, selectedTicketId],
    )

    const hasFinalTicket = Object.keys(finalTicket ?? {}).length > 0

    return (
        <Modal
            size={ModalSize.Xl}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
        >
            <OverlayHeader title="Merge tickets" />
            <OverlayContent>
                <div className={css.container}>
                    <Stepper
                        defaultSelectedItem={MergeTicketsModalTabs.Search}
                        selectedItem={selectedTab}
                        onSelectionChange={(item) =>
                            setSelectedTab(
                                item as ValueOf<typeof MergeTicketsModalTabs>,
                            )
                        }
                    >
                        <StepperTabList className={css.stepperTabList}>
                            <StepperTabItem
                                id={MergeTicketsModalTabs.Search}
                                stepNumber={1}
                                label="Select ticket"
                                state={
                                    selectedTab !== MergeTicketsModalTabs.Search
                                        ? 'done'
                                        : 'current'
                                }
                            />
                            <StepperTabItem
                                id={MergeTicketsModalTabs.FieldsSelection}
                                isDisabled={!selectedTicketId || !targetTicket}
                                stepNumber={2}
                                label="Select properties"
                            />
                        </StepperTabList>
                        <StepperTabPanel id={MergeTicketsModalTabs.Search}>
                            <MergeTicketsModalSearchTab
                                isFetching={isFetching}
                                table={table}
                                columnCount={columnCount}
                                subject={ticket.subject}
                                searchQuery={searchQuery}
                                setSearchQuery={handleSearchQueryChange}
                                onRowClick={handleRowClick}
                            />
                        </StepperTabPanel>
                        <StepperTabPanel
                            id={MergeTicketsModalTabs.FieldsSelection}
                        >
                            {ticket && targetTicket && (
                                <MergeTicketModalFieldsSelectionTab
                                    finalTicket={finalTicket}
                                    setFinalTicket={setFinalTicket}
                                    ticket={ticket}
                                    targetTicket={targetTicket}
                                />
                            )}
                        </StepperTabPanel>
                    </Stepper>
                </div>
            </OverlayContent>
            <OverlayFooter>
                <Box
                    width="100%"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap="md"
                >
                    {selectedTab === MergeTicketsModalTabs.FieldsSelection && (
                        <CheckBoxField
                            label="I understand that this action is irreversible."
                            value={isConfirmationChecked}
                            onChange={setIsConfirmationChecked}
                        />
                    )}
                    <Button
                        variant="primary"
                        onClick={handleMergeTicketsClick}
                        isDisabled={!hasFinalTicket || !isConfirmationChecked}
                    >
                        Merge tickets
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
