import {
    IntegrationType,
    IntegrationWithBusinessHoursAndStore,
} from '@gorgias/helpdesk-types'
import { Button, CheckBoxField, Tooltip } from '@gorgias/merchant-ui-kit'

import { Icon } from 'AlertBanners/components/Icon'
import { AlertBannerTypes } from 'AlertBanners/types'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import StoreDisplayName from 'pages/common/components/StoreDisplayName'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import BusinessHoursDisplay from './BusinessHoursDisplay'
import { useCustomBusinessHoursContext } from './CustomBusinessHoursContext'
import CustomBusinessHoursIntegrationCell from './CustomBusinessHoursIntegrationCell'

import css from './CustomBusinessHoursIntegrationsTable.less'

type Props = {
    integrations?: IntegrationWithBusinessHoursAndStore[]
    onChange: (value: number[]) => void
    value: number[]
    name: string
    isError?: boolean
    refetch?: () => void
}

const integrationsToAdresses = {
    facebook: 'Facebook',
    gorgias_chat: 'Gorgias Chat',
    twitter: 'Twitter',
}

type IntegrationTypeKey = keyof typeof integrationsToAdresses

const isValidIntegrationType = (type: string): type is IntegrationTypeKey =>
    type in integrationsToAdresses

export default function IntegrationRowsField({
    integrations,
    onChange,
    value,
    name,
    isError,
    refetch,
}: Props) {
    const { businessHoursId, toggleIntegrationsToOverride } =
        useCustomBusinessHoursContext()

    const handleClick = (integration: IntegrationWithBusinessHoursAndStore) => {
        const id = integration.integration_id
        const wasPreviouslySelected = value.includes(id)

        onChange(
            wasPreviouslySelected
                ? value.filter((v) => v !== id)
                : [...value, id],
        )

        toggleIntegrationsToOverride([integration], !wasPreviouslySelected)
    }

    return (
        <>
            {!!integrations?.length ? (
                integrations.map((integration) => (
                    <TableBodyRow
                        key={integration.integration_id}
                        onClick={() => handleClick(integration)}
                    >
                        <BodyCell>
                            <CheckBoxField
                                aria-label={`${name}.${integration.integration_id}`}
                                value={value.includes(
                                    integration.integration_id,
                                )}
                            />
                        </BodyCell>
                        <BodyCell>
                            {!!integration.business_hours?.id &&
                                integration.business_hours?.id !==
                                    businessHoursId && (
                                    <>
                                        <Icon
                                            id={`override-icon-${integration.integration_id}`}
                                            type={AlertBannerTypes.Warning}
                                        />
                                        <Tooltip
                                            target={`override-icon-${integration.integration_id}`}
                                        >
                                            This integration is already assigned
                                            to other business hours.
                                        </Tooltip>
                                    </>
                                )}
                        </BodyCell>
                        <BodyCell className={css.integrationNameColumn}>
                            <CustomBusinessHoursIntegrationCell
                                name={integration.integration_name}
                                address={
                                    integration.integration_address ??
                                    (isValidIntegrationType(
                                        integration.integration_type,
                                    )
                                        ? integrationsToAdresses[
                                              integration.integration_type as IntegrationTypeKey
                                          ]
                                        : null)
                                }
                                type={
                                    integration.integration_type as IntegrationType
                                }
                            />
                        </BodyCell>
                        <BodyCell className={css.storeNameColumn}>
                            <StoreDisplayName
                                name={integration.store?.store_name ?? ''}
                                type={integration.store?.store_type ?? ''}
                            />
                        </BodyCell>
                        <BodyCell className={css.businessHoursColumn}>
                            <BusinessHoursDisplay
                                businessHours={
                                    integration.business_hours
                                        ?.business_hours_config
                                }
                            />
                        </BodyCell>
                    </TableBodyRow>
                ))
            ) : (
                <tr>
                    <td colSpan={5}>
                        <NoDataAvailable
                            className={css.noDataAvailable}
                            description={
                                isError ? (
                                    <>
                                        <p>
                                            Something went wrong when fetching
                                            the data. Please try again.
                                        </p>
                                        <Button
                                            intent="primary"
                                            fillStyle="ghost"
                                            onClick={refetch}
                                            className={css.refreshButton}
                                        >
                                            Refresh
                                        </Button>
                                    </>
                                ) : (
                                    "We couldn't find any integration. Please adjust filters or add one to start assigning business hours."
                                )
                            }
                        />
                    </td>
                </tr>
            )}
        </>
    )
}
