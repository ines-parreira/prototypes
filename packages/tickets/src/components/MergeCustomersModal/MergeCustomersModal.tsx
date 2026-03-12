import { useCallback, useState } from 'react'

import {
    Box,
    Button,
    CheckBoxField,
    Heading,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    RadioCard,
    RadioGroup,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { Customer } from '@gorgias/helpdesk-types'

import { useTicketsLegacyBridge } from '../../utils/LegacyBridge'
import { ChannelCheckboxList } from './components/ChannelCheckboxList'
import { CustomerMetaField } from './components/CustomerMetaField'
import { useMergeCustomerData } from './hooks/useMergeCustomerData'
import { useMergeCustomers } from './hooks/useMergeCustomers'
import {
    CustomerSelection,
    getFieldValue,
    useMergeCustomersState,
} from './hooks/useMergeCustomersState'
import { useSourceCustomer } from './hooks/useSourceCustomer'
import { useTicketMessageAddresses } from './hooks/useTicketMessageAddresses'

import css from './MergeCustomersModal.less'

const EMPTY_FIELD_PLACEHOLDER = '-'

interface MergeCustomersModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    destinationCustomer: Customer
    sourceCustomer: Customer | null
    ticketId?: number
    onMerge: () => void
}

export function MergeCustomersModal({
    isOpen,
    onOpenChange,
    destinationCustomer,
    sourceCustomer,
    ticketId,
    onMerge,
}: MergeCustomersModalProps) {
    const [isConfirmationChecked, setIsConfirmationChecked] = useState(false)

    const { humanizeChannel } = useTicketsLegacyBridge()

    const {
        sourceCustomer: fullSourceCustomer,
        isLoading: isLoadingSourceCustomer,
    } = useSourceCustomer(sourceCustomer)

    const {
        destinationEmailChannels,
        destinationIntegrationsByType,
        sourceEmailChannels,
        sourceIntegrationsByType,
        integrationTypes,
        hasNoName,
        hasNoPrimaryEmail,
        hasNoNote,
        hasNoData,
    } = useMergeCustomerData({
        destinationCustomer,
        sourceCustomer: fullSourceCustomer,
    })

    const ticketMessageAddresses = useTicketMessageAddresses(ticketId)

    const { mergeCustomers, isLoading } = useMergeCustomers(ticketId)

    const {
        state,
        setState,
        resetState,
        selectedPrimaryEmail,
        requiredAddresses,
    } = useMergeCustomersState(
        destinationCustomer,
        fullSourceCustomer,
        ticketMessageAddresses,
    )

    const handleChannelToggle = useCallback(
        (channel: (typeof state.selectedChannels)[0]) => {
            const isSelected = state.selectedChannels.some(
                (selectedChannel) => selectedChannel.id === channel.id,
            )

            if (isSelected && requiredAddresses.has(channel.address || '')) {
                return
            }

            const updatedChannels = isSelected
                ? state.selectedChannels.filter(
                      (selectedChannel) => selectedChannel.id !== channel.id,
                  )
                : [...state.selectedChannels, channel]

            setState({
                ...state,
                selectedChannels: updatedChannels,
            })
        },
        [state, setState, requiredAddresses],
    )

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                setIsConfirmationChecked(false)
                resetState()
            }
            onOpenChange(open)
        },
        [onOpenChange, resetState],
    )

    const handleMergeClick = useCallback(async () => {
        if (!destinationCustomer.id || !fullSourceCustomer?.id) {
            return
        }

        try {
            await mergeCustomers(
                {
                    name: getFieldValue(
                        state.selections.name,
                        destinationCustomer.name,
                        fullSourceCustomer.name,
                    ),
                    email: selectedPrimaryEmail,
                    //@ts-expect-error - the API type is incorrect in terms of received channels body
                    channels: state.selectedChannels,
                    note: getFieldValue(
                        state.selections.note,
                        destinationCustomer.note,
                        fullSourceCustomer.note,
                    ),
                    meta: getFieldValue(
                        state.selections.meta,
                        destinationCustomer.meta,
                        fullSourceCustomer.meta,
                    ),
                },
                {
                    target_id: destinationCustomer.id,
                    source_id: fullSourceCustomer.id,
                },
            )

            setIsConfirmationChecked(false)
            onOpenChange(false)
            onMerge()
        } catch {}
    }, [
        fullSourceCustomer,
        destinationCustomer,
        state,
        selectedPrimaryEmail,
        mergeCustomers,
        onOpenChange,
        onMerge,
    ])
    if (!fullSourceCustomer) {
        return null
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            size={ModalSize.Md}
        >
            <OverlayHeader
                title="Merge customers"
                description="Select what data you want to keep, then click the 'Merge' button"
            />
            <OverlayContent>
                <Box
                    flexDirection="column"
                    gap="md"
                    width="100%"
                    className={css.content}
                >
                    <Box
                        flexDirection="row"
                        gap="xs"
                        width="100%"
                        justifyContent="space-between"
                    >
                        <Box width="50%" justifyContent="center">
                            <Heading size="sm">Current customer</Heading>
                        </Box>
                        <Box width="50%" justifyContent="center">
                            <Heading size="sm">Merge customer</Heading>
                        </Box>
                    </Box>

                    <Box>
                        <RadioGroup
                            value={hasNoName ? '' : state.selections.name}
                            onChange={(value) => {
                                setState({
                                    ...state,
                                    selections: {
                                        ...state.selections,
                                        name: value as CustomerSelection,
                                    },
                                })
                            }}
                            className={css.radioGroup}
                        >
                            <RadioCard
                                value={CustomerSelection.Destination}
                                title="Name"
                                isDisabled={!destinationCustomer.name}
                            >
                                <Text size="sm" className={css.cardSubtext}>
                                    {destinationCustomer.name ||
                                        EMPTY_FIELD_PLACEHOLDER}
                                </Text>
                            </RadioCard>
                            <RadioCard
                                value={CustomerSelection.Source}
                                title="Name"
                                isDisabled={!fullSourceCustomer.name}
                            >
                                <Text size="sm" className={css.cardSubtext}>
                                    {fullSourceCustomer.name ||
                                        EMPTY_FIELD_PLACEHOLDER}
                                </Text>
                            </RadioCard>
                        </RadioGroup>
                    </Box>

                    <Box>
                        <RadioGroup
                            value={hasNoNote ? '' : state.selections.note}
                            onChange={(value) => {
                                setState({
                                    ...state,
                                    selections: {
                                        ...state.selections,
                                        note: value as CustomerSelection,
                                    },
                                })
                            }}
                            className={css.radioGroup}
                        >
                            <RadioCard
                                value={CustomerSelection.Destination}
                                title="Note"
                                isDisabled={!destinationCustomer.note}
                            >
                                <Text size="sm" className={css.cardSubtext}>
                                    {destinationCustomer.note ||
                                        EMPTY_FIELD_PLACEHOLDER}
                                </Text>
                            </RadioCard>
                            <RadioCard
                                value={CustomerSelection.Source}
                                title="Note"
                                isDisabled={!fullSourceCustomer.note}
                            >
                                <Text size="sm" className={css.cardSubtext}>
                                    {fullSourceCustomer.note ||
                                        EMPTY_FIELD_PLACEHOLDER}
                                </Text>
                            </RadioCard>
                        </RadioGroup>
                    </Box>

                    <Box>
                        <RadioGroup
                            value={
                                hasNoPrimaryEmail ? '' : state.selections.email
                            }
                            onChange={(value) => {
                                setState({
                                    ...state,
                                    selections: {
                                        ...state.selections,
                                        email: value as CustomerSelection,
                                    },
                                })
                            }}
                            className={css.radioGroup}
                        >
                            <Box width="50%">
                                <Tooltip
                                    trigger={
                                        <RadioCard
                                            value={
                                                CustomerSelection.Destination
                                            }
                                            title="Primary email"
                                            isDisabled={
                                                !destinationCustomer.email
                                            }
                                        >
                                            <Text
                                                size="sm"
                                                className={css.cardSubtext}
                                                overflow="ellipsis"
                                            >
                                                {destinationCustomer.email ||
                                                    EMPTY_FIELD_PLACEHOLDER}
                                            </Text>
                                        </RadioCard>
                                    }
                                >
                                    <TooltipContent>
                                        This is the email address which will be
                                        used to fetch data for the customer
                                    </TooltipContent>
                                </Tooltip>
                            </Box>
                            <Box width="50%">
                                <Tooltip
                                    trigger={
                                        <RadioCard
                                            value={CustomerSelection.Source}
                                            title="Primary email"
                                            isDisabled={
                                                !fullSourceCustomer.email
                                            }
                                        >
                                            <Text
                                                size="sm"
                                                className={css.cardSubtext}
                                                overflow="ellipsis"
                                            >
                                                {fullSourceCustomer.email ||
                                                    EMPTY_FIELD_PLACEHOLDER}
                                            </Text>
                                        </RadioCard>
                                    }
                                >
                                    <TooltipContent>
                                        This is the email address which will be
                                        used to fetch data for the customer
                                    </TooltipContent>
                                </Tooltip>
                            </Box>
                        </RadioGroup>
                    </Box>

                    {(destinationEmailChannels.length > 0 ||
                        sourceEmailChannels.length > 0) && (
                        <Box gap="sm">
                            <Box width="50%">
                                <ChannelCheckboxList
                                    channels={destinationEmailChannels}
                                    selectedChannels={state.selectedChannels}
                                    onToggle={handleChannelToggle}
                                    label="Alternative email"
                                    disabledChannelAddresses={requiredAddresses}
                                />
                            </Box>
                            <Box width="50%">
                                <ChannelCheckboxList
                                    channels={sourceEmailChannels}
                                    selectedChannels={state.selectedChannels}
                                    onToggle={handleChannelToggle}
                                    label="Alternative email"
                                    disabledChannelAddresses={requiredAddresses}
                                />
                            </Box>
                        </Box>
                    )}

                    {integrationTypes.map((integrationType) => {
                        const destIntegrations =
                            destinationIntegrationsByType[integrationType] || []
                        const srcIntegrations =
                            sourceIntegrationsByType[integrationType] || []

                        if (
                            destIntegrations.length === 0 &&
                            srcIntegrations.length === 0
                        ) {
                            return null
                        }

                        const integrationLabel =
                            humanizeChannel(integrationType)

                        return (
                            <Box key={integrationType} gap="sm">
                                <Box width="50%">
                                    <ChannelCheckboxList
                                        channels={destIntegrations}
                                        selectedChannels={
                                            state.selectedChannels
                                        }
                                        onToggle={handleChannelToggle}
                                        label={integrationLabel}
                                        disabledChannelAddresses={
                                            requiredAddresses
                                        }
                                    />
                                </Box>
                                <Box width="50%">
                                    <ChannelCheckboxList
                                        channels={srcIntegrations}
                                        selectedChannels={
                                            state.selectedChannels
                                        }
                                        onToggle={handleChannelToggle}
                                        label={integrationLabel}
                                        disabledChannelAddresses={
                                            requiredAddresses
                                        }
                                    />
                                </Box>
                            </Box>
                        )
                    })}

                    <Box>
                        <CustomerMetaField
                            destinationData={destinationCustomer.meta || {}}
                            sourceData={fullSourceCustomer.meta || {}}
                            selectedValue={state.selections.meta}
                            onChange={(value) => {
                                setState({
                                    ...state,
                                    selections: {
                                        ...state.selections,
                                        meta: value,
                                    },
                                })
                            }}
                            isDisabled={hasNoData}
                        />
                    </Box>
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Box
                    flexDirection="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap="md"
                    className={css.footer}
                >
                    <CheckBoxField
                        label="I understand that this action is irreversible."
                        value={isConfirmationChecked}
                        onChange={setIsConfirmationChecked}
                    />
                    <Button
                        variant="primary"
                        onClick={handleMergeClick}
                        isDisabled={
                            !isConfirmationChecked ||
                            isLoading ||
                            isLoadingSourceCustomer
                        }
                        isLoading={isLoading}
                    >
                        Merge
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
