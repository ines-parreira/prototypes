import { BusinessHoursList } from '@gorgias/helpdesk-types'
import { Badge, IconButton, Label } from '@gorgias/merchant-ui-kit'

import SourceIcon from 'pages/common/components/SourceIcon'
import StoreDisplayName from 'pages/common/components/StoreDisplayName'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import BusinessHoursScheduleDisplay from './BusinessHoursScheduleDisplay'
import { mockedBusinessHours } from './constants'

import css from './ListCustomBusinessHours.less'

type Props = {
    businessHours?: BusinessHoursList
}

export default function ListCustomBusinessHoursTableRow({
    businessHours = mockedBusinessHours,
}: Props) {
    return (
        <TableBodyRow>
            <BodyCell className={css.nameScheduleColumn}>
                <div className={css.nameScheduleContent}>
                    <Label>{businessHours.name}</Label>
                    <BusinessHoursScheduleDisplay
                        className={css.schedule}
                        businessHoursConfig={
                            businessHours.business_hours_config
                        }
                    />
                </div>
            </BodyCell>
            <BodyCell className={css.integrationColumn}>
                {businessHours.integration_count === 1 ? (
                    <div className={css.linkedIntegration}>
                        {businessHours.first_integration?.store && (
                            <StoreDisplayName
                                name={
                                    businessHours.first_integration?.store
                                        ?.store_name
                                }
                                type={
                                    businessHours.first_integration?.store
                                        ?.store_type
                                }
                            />
                        )}
                        <div className={css.integrationLabel}>
                            <SourceIcon
                                type={
                                    businessHours.first_integration
                                        ?.integration_type
                                }
                            />
                            <div>
                                {
                                    businessHours.first_integration
                                        ?.integration_name
                                }
                            </div>
                        </div>
                    </div>
                ) : (
                    <Badge type="blue" corner="square">
                        {businessHours.integration_count} integrations
                    </Badge>
                )}
            </BodyCell>
            <BodyCell className={css.timezoneColumn}>
                {businessHours.business_hours_config.timezone.replace(
                    '/',
                    ' / ',
                )}
            </BodyCell>
            <BodyCell className={css.actionsColumn}>
                <div className={css.actionsColumnContent}>
                    <IconButton
                        icon="edit"
                        intent="secondary"
                        fillStyle="ghost"
                    />
                    <IconButton
                        icon="delete"
                        intent="destructive"
                        fillStyle="ghost"
                    />
                </div>
            </BodyCell>
        </TableBodyRow>
    )
}
