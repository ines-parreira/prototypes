import React from 'react'

import { useHistory } from 'react-router-dom'

import {
    IconName,
    MenuItem,
    OverflowListItem,
    SubMenu,
    Text,
} from '@gorgias/axiom'

import { useTicketsLegacyBridge } from '../../utils/LegacyBridge/useTicketsLegacyBridge'
import {
    formatPhoneNumberInternational,
    validateChannelField,
} from '../../utils/validation'
import { EditableField } from './components/EditableField'
import { EditableMenuField } from './components/EditableMenuField'
import { FieldRow } from './components/FieldRow'
import { TriggerLabel } from './components/TriggerLabel'
import { VoiceFieldMenuItems } from './components/VoiceFieldMenuItems'
import {
    useBaseCustomerFields,
    useCustomerChannels,
    useCustomerLocalTime,
    useCustomerLocation,
} from './hooks'
import { usePhoneAndSMSIntegrations } from './hooks/usePhoneAndSMSIntegrations'

import css from './InfobarCustomerFields.less'

function formatChannelTypeLabel(type: string): string {
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

interface InfobarBaseCustomerFieldsProps {
    ticketId: string
}

export function InfobarBaseCustomerFields({
    ticketId,
}: InfobarBaseCustomerFieldsProps) {
    const { customer, handleNoteChange, handleChannelChange } =
        useBaseCustomerFields(ticketId)
    const { handleTicketDraft } = useTicketsLegacyBridge()
    const { hasDraft, onResumeDraft, onDiscardDraft } = handleTicketDraft
    const history = useHistory()

    const { location } = useCustomerLocation(customer)
    const { emailChannels, phoneChannels, otherChannels } = useCustomerChannels(
        customer?.channels,
    )
    const localTime = useCustomerLocalTime(customer)
    const { phoneIntegrations, smsIntegrations, phoneNumbers, isLoading } =
        usePhoneAndSMSIntegrations()
    const note = customer?.note

    if (!customer) {
        return null
    }

    return (
        <>
            <OverflowListItem className={css.overflowListItem}>
                <FieldRow label="Note">
                    <EditableField
                        value={note || ''}
                        onValueChange={handleNoteChange}
                        placeholder="+ Add"
                    />
                </FieldRow>
            </OverflowListItem>
            {location && (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Location">
                        <Text
                            size="sm"
                            overflow="ellipsis"
                            className={css.fieldValue}
                        >
                            {location}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
            )}
            {localTime && (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Local time">
                        <Text
                            size="sm"
                            overflow="ellipsis"
                            className={css.fieldValue}
                        >
                            {localTime}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
            )}
            {phoneChannels.length > 0 ? (
                phoneChannels.map((channel, index) => (
                    <OverflowListItem
                        key={channel.id}
                        className={css.overflowListItem}
                    >
                        <FieldRow label={index === 0 ? 'Phone' : null}>
                            <EditableMenuField
                                value={channel.address || ''}
                                onValueChange={(value) =>
                                    handleChannelChange(
                                        channel.id,
                                        'phone',
                                        value,
                                    )
                                }
                                placeholder="+ Add"
                                validator={(value) =>
                                    validateChannelField('phone', value)
                                }
                                name="number"
                                onDelete={() =>
                                    handleChannelChange(channel.id, 'phone', '')
                                }
                                renderTrigger={(value) => (
                                    <TriggerLabel
                                        label={formatPhoneNumberInternational(
                                            value,
                                        )}
                                    />
                                )}
                            >
                                <VoiceFieldMenuItems
                                    phoneAddress={channel.address || ''}
                                    customerId={customer.id.toString()}
                                    customerName={customer.name || ''}
                                    phoneIntegrations={phoneIntegrations}
                                    smsIntegrations={smsIntegrations}
                                    phoneNumbers={phoneNumbers}
                                    isLoading={isLoading}
                                />
                            </EditableMenuField>
                        </FieldRow>
                    </OverflowListItem>
                ))
            ) : (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Phone">
                        <EditableField<string>
                            onValueChange={(value) =>
                                handleChannelChange(null, 'phone', value)
                            }
                            placeholder="+ Add"
                            validator={(value) =>
                                validateChannelField('phone', value)
                            }
                        />
                    </FieldRow>
                </OverflowListItem>
            )}
            {emailChannels.length > 0 ? (
                emailChannels.map((channel, index) => {
                    const createTicketLocation = {
                        pathname: `/app/ticket/new`,
                        search: `?customer=${customer.id}`,
                        state: {
                            receiver: {
                                name: customer.name || '',
                                address: channel.address || '',
                            },
                            _navigationKey: Date.now(),
                        },
                    }

                    return (
                        <OverflowListItem
                            key={channel.id}
                            className={css.overflowListItem}
                        >
                            <FieldRow label={index === 0 ? 'Email' : null}>
                                <EditableMenuField
                                    value={channel.address || ''}
                                    onValueChange={(value) =>
                                        handleChannelChange(
                                            channel.id,
                                            'email',
                                            value,
                                        )
                                    }
                                    placeholder="+ Add"
                                    validator={(value) =>
                                        validateChannelField('email', value)
                                    }
                                    name="email"
                                    onDelete={() =>
                                        handleChannelChange(
                                            channel.id,
                                            'email',
                                            '',
                                        )
                                    }
                                    renderTrigger={(value) => (
                                        <TriggerLabel
                                            label={value}
                                            tooltipText="Send email as new ticket"
                                        />
                                    )}
                                >
                                    {hasDraft ? (
                                        <SubMenu
                                            label="Send email"
                                            leadingSlot={IconName.CommMail}
                                        >
                                            <MenuItem
                                                label="A draft ticket already exists"
                                                isDisabled
                                            />
                                            <MenuItem
                                                label="Resume draft"
                                                onAction={onResumeDraft}
                                            />
                                            <MenuItem
                                                label="Discard and create new ticket"
                                                onAction={() =>
                                                    onDiscardDraft(
                                                        createTicketLocation,
                                                    )
                                                }
                                            />
                                        </SubMenu>
                                    ) : (
                                        <MenuItem
                                            label="Send email"
                                            leadingSlot={IconName.CommMail}
                                            onAction={() =>
                                                history.push(
                                                    createTicketLocation,
                                                )
                                            }
                                        />
                                    )}
                                </EditableMenuField>
                            </FieldRow>
                        </OverflowListItem>
                    )
                })
            ) : (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Email">
                        <EditableField<string>
                            onValueChange={(value) =>
                                handleChannelChange(null, 'email', value)
                            }
                            placeholder="+ Add"
                            validator={(value) =>
                                validateChannelField('email', value)
                            }
                        />
                    </FieldRow>
                </OverflowListItem>
            )}
            {otherChannels.map((channel, index) => {
                const showLabel =
                    index === 0 ||
                    otherChannels[index - 1].type !== channel.type

                return (
                    <OverflowListItem
                        key={channel.id}
                        className={css.overflowListItem}
                    >
                        <FieldRow
                            label={
                                showLabel
                                    ? formatChannelTypeLabel(channel.type)
                                    : null
                            }
                        >
                            <Text
                                size="sm"
                                overflow="ellipsis"
                                className={css.fieldValue}
                            >
                                {channel.address}
                            </Text>
                        </FieldRow>
                    </OverflowListItem>
                )
            })}
        </>
    )
}
