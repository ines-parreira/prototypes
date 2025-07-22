import {
    IntegrationType,
    IntegrationWithBusinessHoursAndStore,
} from '@gorgias/helpdesk-types'
import { CheckBoxField } from '@gorgias/merchant-ui-kit'

import { Icon } from 'AlertBanners/components/Icon'
import { AlertBannerTypes } from 'AlertBanners/types'
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
}

export default function IntegrationRowsField({
    hasWarning,
    integrations,
    onItemClick,
    onChange,
    value,
    name,
}: Props) {
    const handleClick = (id: number) => {
        onChange(
            value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
        )
        onItemClick(id)
    }

    return (
        <>
            {integrations?.map((integration) => (
                <TableBodyRow
                    key={integration.integration_id}
                    onClick={() => handleClick(integration.integration_id)}
                >
                    <BodyCell>
                        <CheckBoxField
                            aria-label={`${name}.${integration.integration_id}`}
                            value={value.includes(integration.integration_id)}
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
            ))}
        </>
    )
}
