import React from 'react'

import { OverflowListItem, Text } from '@gorgias/axiom'

import {
    formatPhoneNumberInternational,
    validateChannelField,
} from '../../utils/validation'
import { EditableField } from './components/EditableField'
import { FieldRow } from './components/FieldRow'
import {
    useBaseCustomerFields,
    useCustomerChannels,
    useCustomerLocalTime,
    useCustomerLocation,
} from './hooks'

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

    const { location } = useCustomerLocation(customer)
    const { emailChannels, phoneChannels, otherChannels } = useCustomerChannels(
        customer?.channels,
    )
    const localTime = useCustomerLocalTime(customer)
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
                            <EditableField
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
                                renderDisplay={(value, onClick) => (
                                    <Text
                                        size="sm"
                                        overflow="ellipsis"
                                        className={`${css.fieldValue} ${css.isEditable}`}
                                        onClick={onClick}
                                    >
                                        <a
                                            className={css.emailLink}
                                            href={`tel:${value}`}
                                        >
                                            {formatPhoneNumberInternational(
                                                value,
                                            )}
                                        </a>
                                    </Text>
                                )}
                            />
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
                emailChannels.map((channel, index) => (
                    <OverflowListItem
                        key={channel.id}
                        className={css.overflowListItem}
                    >
                        <FieldRow label={index === 0 ? 'Email' : null}>
                            <EditableField
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
                                renderDisplay={(value, onClick) => (
                                    <Text
                                        size="sm"
                                        overflow="ellipsis"
                                        className={`${css.fieldValue} ${css.isEditable}`}
                                        onClick={onClick}
                                    >
                                        <a
                                            className={css.emailLink}
                                            href={`mailto:${value}`}
                                        >
                                            {value}
                                        </a>
                                    </Text>
                                )}
                            />
                        </FieldRow>
                    </OverflowListItem>
                ))
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
