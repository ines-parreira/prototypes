import React, { useCallback, useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { reverse, sortBy } from 'lodash'

import { PhoneUseCase } from 'business/twilio'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { IntegrationType } from 'models/integration/types'
import type { NewPhoneNumber, PhoneNumber } from 'models/phoneNumber/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

import PhoneNumberTitle from './PhoneNumberTitle'

import css from './PhoneNumbersList.less'

export function PhoneNumbersList(): JSX.Element | null {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const isMarketingPhoneNumberEnabled = useFlag(
        FeatureFlagKey.MarketingPhoneNumber,
    )

    const [orderBy, setOrderBy] = useState<string>('id')
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc,
    )
    const [sortedPhoneNumbers, setSortedPhoneNumbers] = useState<
        NewPhoneNumber[]
    >(Object.values(phoneNumbers))

    useEffect(() => {
        const numbers = Object.values(phoneNumbers)
        setSortedPhoneNumbers(
            orderDirection === OrderDirection.Asc
                ? sortBy(numbers, orderBy)
                : reverse(sortBy(numbers, orderBy)),
        )
    }, [phoneNumbers, orderBy, orderDirection, setSortedPhoneNumbers])

    const setSortOptions = useCallback(
        (column: string) => {
            if (orderBy === column) {
                setOrderDirection(
                    orderDirection === OrderDirection.Asc
                        ? OrderDirection.Desc
                        : OrderDirection.Asc,
                )
            } else {
                setOrderBy(column)
                setOrderDirection(OrderDirection.Asc)
            }
        },
        [setOrderBy, setOrderDirection, orderBy, orderDirection],
    )

    if (!sortedPhoneNumbers.length) {
        return null
    }

    const hasIntegration = (
        phoneNumber: PhoneNumber,
        type: IntegrationType,
    ): boolean => {
        return !!phoneNumber.integrations.find(
            (integration) => integration.type === type,
        )
    }

    return (
        <TableWrapper className={css.table}>
            <TableHead className={css.header}>
                <HeaderCellProperty
                    title="Phone Number"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'name'}
                    onClick={() => setSortOptions('name')}
                />
                {isMarketingPhoneNumberEnabled && (
                    <HeaderCellProperty
                        title="Use case"
                        direction={orderDirection}
                        isOrderedBy={orderBy === 'usecase'}
                        onClick={() => setSortOptions('usecase')}
                    />
                )}
                <HeaderCellProperty
                    title="Connected Apps"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'integrations'}
                    onClick={() => setSortOptions('integrations')}
                />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {sortedPhoneNumbers.map((phoneNumber) => {
                    const detailsLink = `/app/settings/phone-numbers/${phoneNumber.id}`
                    return (
                        <TableBodyRow
                            key={phoneNumber.id}
                            onClick={() => {
                                history.push(detailsLink)
                            }}
                        >
                            <BodyCell size="small">
                                <PhoneNumberTitle
                                    phoneNumber={phoneNumber}
                                    withRoundFlag
                                />
                            </BodyCell>
                            {isMarketingPhoneNumberEnabled && (
                                <BodyCell>
                                    {phoneNumber.usecase ===
                                    PhoneUseCase.Marketing
                                        ? 'Marketing'
                                        : 'Standard'}
                                </BodyCell>
                            )}
                            <BodyCell>
                                {hasIntegration(
                                    phoneNumber,
                                    IntegrationType.Phone,
                                ) && (
                                    <SourceIcon
                                        type={IntegrationType.Phone}
                                        className="md-2 mr-2"
                                    />
                                )}
                                {hasIntegration(
                                    phoneNumber,
                                    IntegrationType.Sms,
                                ) && (
                                    <SourceIcon
                                        type={IntegrationType.Sms}
                                        className="md-2 mr-2"
                                    />
                                )}
                                {hasIntegration(
                                    phoneNumber,
                                    IntegrationType.WhatsApp,
                                ) && (
                                    <SourceIcon
                                        type={IntegrationType.WhatsApp}
                                        className="md-2 mr-2"
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

export default PhoneNumbersList
