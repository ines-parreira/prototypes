import React, {useEffect, useState, useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {sortBy, reverse, startCase} from 'lodash'

import {OrderDirection} from 'models/api/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {RootState} from 'state/types'
import history from 'pages/history'
import Loader from 'pages/common/components/Loader/Loader'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ForwardIcon from 'pages/integrations/detail/components/ForwardIcon'
import {TagLabel} from 'pages/common/utils/labels'

import CountryFlag from './CountryFlag'
import css from './PhoneNumbersTable.less'

type Props = {
    isLoading?: boolean
}

export function PhoneNumbersTable({
    isLoading = false,
    phoneNumbers,
}: Props & ConnectedProps<typeof connector>) {
    const [orderBy, setOrderBy] = useState<string>('id')
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc
    )
    const [sortedPhoneNumbers, setSortedPhoneNumbers] = useState<PhoneNumber[]>(
        Object.values(phoneNumbers)
    )

    useEffect(() => {
        const numbers = Object.values(phoneNumbers)
        setSortedPhoneNumbers(
            orderDirection === OrderDirection.Asc
                ? sortBy(numbers, orderBy)
                : reverse(sortBy(numbers, orderBy))
        )
    }, [phoneNumbers, orderBy, orderDirection, setSortedPhoneNumbers])

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

    return (
        <TableWrapper>
            <TableHead className={css.header}>
                <HeaderCellProperty
                    title="Phone Number"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'name'}
                    onClick={() => setSortOptions('name')}
                />
                <HeaderCellProperty
                    title="Type"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'meta.type'}
                    onClick={() => setSortOptions('meta.type')}
                />
                <HeaderCell />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {isLoading ? (
                    <TableBodyRow>
                        <BodyCell colSpan={4}>
                            <Loader />
                        </BodyCell>
                    </TableBodyRow>
                ) : (
                    sortedPhoneNumbers.map((phoneNumber) => {
                        const detailsLink = `/app/settings/phone-numbers/${phoneNumber.id}`
                        return (
                            <TableBodyRow
                                key={phoneNumber.id}
                                className={css.row}
                                onClick={() => {
                                    history.push(detailsLink)
                                }}
                            >
                                <BodyCell>
                                    <CountryFlag
                                        countryCode={phoneNumber.meta.country}
                                    />
                                    &nbsp;
                                    <strong className="mr-3">
                                        {phoneNumber.name}
                                    </strong>
                                    &nbsp;
                                    <span>
                                        {phoneNumber.meta.friendly_name}
                                    </span>
                                </BodyCell>
                                <BodyCell>
                                    <TagLabel>
                                        {startCase(phoneNumber.meta?.type)}
                                    </TagLabel>
                                </BodyCell>
                                <BodyCell>
                                    <div style={{width: '400px'}} />
                                </BodyCell>
                                <BodyCell className="smallest">
                                    <ForwardIcon href={detailsLink} />
                                </BodyCell>
                            </TableBodyRow>
                        )
                    })
                )}
            </TableBody>
        </TableWrapper>
    )
}

const connector = connect((state: RootState) => ({
    phoneNumbers: state.entities.phoneNumbers,
}))

export default connector(PhoneNumbersTable)
