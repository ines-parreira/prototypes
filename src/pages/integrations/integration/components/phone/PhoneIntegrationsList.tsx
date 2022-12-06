import React, {useState, useCallback, useMemo} from 'react'
import {sortBy, reverse} from 'lodash'
import {useDeepCompareEffect} from 'react-use'
import {Container} from 'reactstrap'

import {OrderDirection} from 'models/api/types'
import {
    PhoneIntegration,
    IntegrationType,
    SmsIntegration,
    WhatsAppIntegration,
    isWhatsAppIntegration,
} from 'models/integration/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {getIntegrationConfig} from 'state/integrations/helpers'
import {getIntegrationsByType} from 'state/integrations/selectors'
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
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'

import settingsCss from 'pages/settings/settings.less'
import css from './PhoneIntegrationsList.less'

type Row = {
    integration: PhoneIntegration | SmsIntegration | WhatsAppIntegration
    phoneNumber: Maybe<PhoneNumber>
}

type Props = {
    type: IntegrationType.Phone | IntegrationType.Sms | IntegrationType.WhatsApp
}

export function PhoneIntegrationsList({type}: Props): JSX.Element | null {
    const config = getIntegrationConfig(type)
    const integrations = useAppSelector(
        getIntegrationsByType<
            PhoneIntegration | SmsIntegration | WhatsAppIntegration
        >(type)
    )

    const phoneNumbers = useAppSelector(getPhoneNumbers)
    const rows: Row[] = useMemo(
        () =>
            integrations.reduce(
                (
                    rows: Row[],
                    integration:
                        | PhoneIntegration
                        | SmsIntegration
                        | WhatsAppIntegration
                ) => {
                    // TODO(@anddon): remove this once the new API for phone is available
                    const phoneNumber = isWhatsAppIntegration(integration)
                        ? phoneNumbers[integration.meta.phone_number_id]
                        : phoneNumbers[integration.meta?.twilio_phone_number_id]
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
        [integrations, phoneNumbers]
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
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <p>You have no integration of this type at the moment.</p>
                <AddButton type={type} />
            </Container>
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
                            orderBy === 'phoneNumber.meta.friendly_name'
                        }
                        onClick={() =>
                            setSortOptions('phoneNumber.meta.friendly_name')
                        }
                    />
                    <HeaderCell />
                </TableHead>
                <TableBody>
                    {sortedRows.map((row) => {
                        const {
                            integration: {id, type, name, meta},
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
                <AddButton type={type} />
            </Container>
        </>
    )
}

function AddButton({type}: Pick<Props, 'type'>) {
    const openOnboardingPage = (type: IntegrationType) => {
        const url =
            type === IntegrationType.WhatsApp
                ? `/app/settings/integrations/${type}/new`
                : `/app/settings/channels/${type}/new`

        if (type === IntegrationType.WhatsApp) {
            window.location.href = url
            return
        }

        history.push(url)
    }

    const name = {
        [IntegrationType.Sms]: 'SMS',
        [IntegrationType.Phone]: 'Voice',
        [IntegrationType.WhatsApp]: 'WhatsApp',
    }[type]

    return (
        <Button onClick={() => openOnboardingPage(type)}>
            {`Add ${name}`}
        </Button>
    )
}

export default PhoneIntegrationsList
