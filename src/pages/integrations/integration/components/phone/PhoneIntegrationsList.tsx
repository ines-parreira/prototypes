import React, { useCallback, useMemo, useState } from 'react'

import { reverse, sortBy } from 'lodash'
import { Container } from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import {
    IntegrationType,
    PhoneIntegration,
    SmsIntegration,
    WhatsAppIntegration,
} from 'models/integration/types'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import history from 'pages/history'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'
import { getIntegrationConfig } from 'state/integrations/helpers'
import { getIntegrationsByType } from 'state/integrations/selectors'

import css from './PhoneIntegrationsList.less'

type Row = {
    integration: PhoneIntegration | SmsIntegration | WhatsAppIntegration
    phoneNumber: Maybe<NewPhoneNumber>
}

type Props = {
    type: IntegrationType.Phone | IntegrationType.Sms | IntegrationType.WhatsApp
}

export default function PhoneIntegrationsList({
    type,
}: Props): JSX.Element | null {
    const config = getIntegrationConfig(type)

    const getIntegrations = useMemo(
        () =>
            getIntegrationsByType<
                PhoneIntegration | SmsIntegration | WhatsAppIntegration
            >(type),
        [type],
    )

    const integrations = useAppSelector(getIntegrations)

    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const rows: Row[] = useMemo(
        () =>
            integrations.reduce(
                (
                    rows: Row[],
                    integration:
                        | PhoneIntegration
                        | SmsIntegration
                        | WhatsAppIntegration,
                ) => {
                    const phoneNumber =
                        phoneNumbers[integration.meta?.phone_number_id]
                    return [
                        ...rows,
                        {
                            integration,
                            phoneNumber,
                        },
                    ]
                },
                [],
            ),
        [integrations, phoneNumbers],
    )

    const [orderBy, setOrderBy] = useState<string>('integration.id')
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc,
    )

    const sortedRows = useMemo(
        () =>
            orderDirection === OrderDirection.Asc
                ? sortBy(rows, orderBy)
                : reverse(sortBy(rows, orderBy)),
        [rows, orderBy, orderDirection],
    )

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

    if (!sortedRows.length) {
        return (
            <SettingsPageContainer>
                <SettingsContent>
                    <p>You have no integration of this type at the moment.</p>
                </SettingsContent>
            </SettingsPageContainer>
        )
    }

    return (
        <>
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
                        isOrderedBy={
                            orderBy === 'phoneNumber.phone_number_friendly'
                        }
                        onClick={() =>
                            setSortOptions('phoneNumber.phone_number_friendly')
                        }
                    />
                    <HeaderCell />
                </TableHead>
                <TableBody>
                    {sortedRows.map((row) => {
                        const {
                            integration: { id, type, name, meta },
                            phoneNumber,
                        } = row
                        const detailsLink =
                            type === IntegrationType.WhatsApp
                                ? `/app/settings/integrations/${type}/${id}/preferences`
                                : `/app/settings/channels/${type}/${id}/preferences`

                        return (
                            <TableBodyRow
                                key={id}
                                onClick={() => {
                                    history.push(detailsLink)
                                }}
                            >
                                <BodyCell>
                                    {meta.emoji && (
                                        <span className="mr-2">
                                            {meta.emoji}
                                        </span>
                                    )}
                                    <strong>{name}</strong>
                                </BodyCell>
                                <BodyCell
                                    className={css.phoneCell}
                                    size="small"
                                >
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
            <Container fluid className={css.footer}>
                <p>
                    {config?.description}
                    {type !== IntegrationType.WhatsApp && (
                        <a
                            href={config?.pricingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            &nbsp;Additional charges apply.
                        </a>
                    )}
                </p>
            </Container>
        </>
    )
}
