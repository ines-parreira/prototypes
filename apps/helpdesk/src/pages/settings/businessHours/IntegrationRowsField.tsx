import {
    IntegrationType,
    IntegrationWithBusinessHoursAndStore,
} from '@gorgias/helpdesk-types'
import { Button, CheckBoxField } from '@gorgias/merchant-ui-kit'

import { Icon } from 'AlertBanners/components/Icon'
import { AlertBannerTypes } from 'AlertBanners/types'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import StoreDisplayName from 'pages/common/components/StoreDisplayName'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import BusinessHoursDisplay from './BusinessHoursDisplay'
import CustomBusinessHoursIntegrationCell from './CustomBusinessHoursIntegrationCell'

import css from './CustomBusinessHoursIntegrationsTable.less'

type Props = {
    hasWarning?: boolean
    integrations?: IntegrationWithBusinessHoursAndStore[]
    onChange: (value: number[]) => void
    onItemClick: (id: number) => void
    value: number[]
    name: string
    isError?: boolean
    refetch?: () => void
}

export default function IntegrationRowsField({
    hasWarning,
    integrations,
    onItemClick,
    onChange,
    value,
    name,
    isError,
    refetch,
}: Props) {
    const handleClick = (id: number) => {
        onChange(
            value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
        )
        onItemClick(id)
    }

    return (
        <>
            {!!integrations?.length ? (
                integrations.map((integration) => (
                    <TableBodyRow
                        key={integration.integration_id}
                        onClick={() => handleClick(integration.integration_id)}
                    >
                        <BodyCell>
                            <CheckBoxField
                                aria-label={`${name}.${integration.integration_id}`}
                                value={value.includes(
                                    integration.integration_id,
                                )}
                            />
                        </BodyCell>
                        {hasWarning && (
                            <BodyCell>
                                <Icon type={AlertBannerTypes.Warning} />
                            </BodyCell>
                        )}
                        <BodyCell className={css.integrationNameColumn}>
                            <CustomBusinessHoursIntegrationCell
                                name={integration.integration_name}
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
                    <td colSpan={4}>
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
                                    'You don’t have any integrations yet. Please add one to start assigning business hours.'
                                )
                            }
                        />
                    </td>
                </tr>
            )}
        </>
    )
}
