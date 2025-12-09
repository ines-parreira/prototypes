import type { ReactNode } from 'react'
import React from 'react'

import { useParams } from 'react-router-dom'

import {
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Text,
} from '@gorgias/axiom'

import {
    formatPhoneNumberInternational,
    validateChannelField,
} from '../../utils/validation'
import { EditableField } from './EditableField'
import { useBaseCustomerFields } from './hooks/useBaseCustomerFields'
import { useCustomerChannels } from './hooks/useCustomerChannels'
import { useCustomerLocalTime } from './hooks/useCustomerLocalTime'
import { useCustomerLocation } from './hooks/useCustomerLocation'

import css from './InfobarBaseCustomerFields.less'

function formatChannelTypeLabel(type: string): string {
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const Label = ({ children }: { children: ReactNode }) => {
    return (
        <Text className={css.label} size="sm">
            {children}
        </Text>
    )
}

type FieldRowProps = {
    label: React.ReactNode
    children: React.ReactNode
}

const FieldRow = ({ label, children }: FieldRowProps) => {
    return (
        <div className={css.row}>
            {label ?? <div />}
            {children}
        </div>
    )
}

export function InfobarBaseCustomerFields() {
    const { ticketId } = useParams<{ ticketId: string }>()

    const { customer, handleNoteChange, handleChannelChange } =
        useBaseCustomerFields(ticketId!)

    const { location } = useCustomerLocation(customer)
    const { emailChannels, phoneChannels, otherChannels } = useCustomerChannels(
        customer?.channels,
    )
    const localTime = useCustomerLocalTime(customer)
    const note = customer?.note

    if (!ticketId || !customer) {
        return null
    }

    return (
        <OverflowList className={css.overflowList} nonExpandedLineCount={7}>
            <OverflowListItem className={css.overflowListItem}>
                <FieldRow label={<Label>Note</Label>}>
                    <EditableField
                        value={note || ''}
                        onValueChange={handleNoteChange}
                        placeholder="+ Add"
                    />
                </FieldRow>
            </OverflowListItem>
            {location && (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label={<Label>Location</Label>}>
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
                    <FieldRow label={<Label>Local time</Label>}>
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
                        <FieldRow
                            label={index === 0 ? <Label>Phone</Label> : <div />}
                        >
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
                    <FieldRow label={<Label>Phone</Label>}>
                        <EditableField
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
                        <FieldRow
                            label={index === 0 ? <Label>Email</Label> : <div />}
                        >
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
                    <FieldRow label={<Label>Email</Label>}>
                        <EditableField
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
                                showLabel ? (
                                    <Label>
                                        {formatChannelTypeLabel(channel.type)}
                                    </Label>
                                ) : (
                                    <div />
                                )
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
            <OverflowListShowMore
                // @ts-ignore - this will be added as a valid prop
                leadingSlot="arrow-chevron-down"
            >
                Show more
            </OverflowListShowMore>
            <OverflowListShowLess
                // @ts-ignore - this will be added as a valid prop
                leadingSlot="arrow-chevron-up"
            >
                Show less
            </OverflowListShowLess>
        </OverflowList>
    )
}
