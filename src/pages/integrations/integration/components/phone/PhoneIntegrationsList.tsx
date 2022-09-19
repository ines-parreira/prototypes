import React, {useState, useCallback, useMemo} from 'react'
import {sortBy, reverse} from 'lodash'
import {useDeepCompareEffect} from 'react-use'

import {OrderDirection} from 'models/api/types'
import {
    PhoneIntegration,
    IntegrationType,
    isPhoneIntegration,
    isSmsIntegration,
    SmsIntegration,
} from 'models/integration/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'

import css from './PhoneIntegrationsList.less'

type Row = {
    integration: PhoneIntegration | SmsIntegration
    phoneNumber: Maybe<PhoneNumber>
}

type Props = {
    type: IntegrationType.Phone | IntegrationType.Sms
}

export function PhoneIntegrationsList({type}: Props): JSX.Element | null {
    const integrations = useAppSelector(getIntegrationsByTypes([type]))
    const phoneIntegrations: Array<PhoneIntegration | SmsIntegration> =
        type === IntegrationType.Phone
            ? integrations.filter(isPhoneIntegration)
            : integrations.filter(isSmsIntegration)

    const phoneNumbers = useAppSelector(getPhoneNumbers)

    const rows: Row[] = useMemo(
        () =>
            phoneIntegrations.reduce(
                (
                    rows: Row[],
                    integration: PhoneIntegration | SmsIntegration
                ) => {
                    const phoneNumber =
                        phoneNumbers[integration.meta.twilio_phone_number_id]
                    return [
                        ...rows,
                        {
                            integration,
                            phoneNumber,
                        },
                    ]
                },
                []
            ),
        [phoneIntegrations, phoneNumbers]
    )

    const [orderBy, setOrderBy] = useState<string>('integration.id')
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc
    )
    const [sortedRows, setSortedRows] = useState<Row[]>(rows)

    useDeepCompareEffect(() => {
        setSortedRows(
            orderDirection === OrderDirection.Asc
                ? sortBy(rows, orderBy)
                : reverse(sortBy(rows, orderBy))
        )
    }, [orderBy, orderDirection, setSortedRows, rows])

    const setSortOptions = useCallback(
        (column: string) => {
            if (orderBy === column) {
                setOrderDirection(
                    orderDirection === OrderDirection.Asc
                        ? OrderDirection.Desc
                        : OrderDirection.Asc
                )
            } else {
                setOrderBy(column)
                setOrderDirection(OrderDirection.Asc)
            }
        },
        [setOrderBy, setOrderDirection, orderBy, orderDirection]
    )

    if (!sortedRows.length) {
        return null
    }

    return (
        <TableWrapper className={css.table}>
            <TableHead className={css.header}>
                <HeaderCellProperty
                    title="Title"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'integration.name'}
                    onClick={() => setSortOptions('integration.name')}
                />
                <HeaderCellProperty
                    title="Phone Number"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'phoneNumber.meta.friendly_name'}
                    onClick={() =>
                        setSortOptions('phoneNumber.meta.friendly_name')
                    }
                />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {sortedRows.map((row) => {
                    const {
                        integration: {id, name, meta},
                        phoneNumber,
                    } = row
                    const detailsLink = `/app/settings/integrations/${type}/${id}/preferences`
                    return (
                        <TableBodyRow
                            key={id}
                            onClick={() => {
                                history.push(detailsLink)
                            }}
                        >
                            <BodyCell>
                                {meta.emoji && (
                                    <span className="mr-2">{meta.emoji}</span>
                                )}
                                <strong>{name}</strong>
                            </BodyCell>
                            <BodyCell className={css.phoneCell} size="small">
                                {phoneNumber && (
                                    <PhoneNumberTitle
                                        phoneNumber={phoneNumber}
                                        withRoundFlag
                                    />
                                )}
                            </BodyCell>
                            <BodyCell>
                                <ForwardIcon href={detailsLink} />
                            </BodyCell>
                        </TableBodyRow>
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}

export default PhoneIntegrationsList
