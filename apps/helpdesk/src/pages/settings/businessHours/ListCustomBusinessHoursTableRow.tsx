import { useState } from 'react'

import { Link } from 'react-router-dom'

import {
    Badge,
    LegacyIconButton as IconButton,
    Label,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { BusinessHoursList } from '@gorgias/helpdesk-types'

import useDeleteCustomBusinessHours from 'hooks/businessHours/useDeleteCustomBusinessHours'
import SourceIcon from 'pages/common/components/SourceIcon'
import StoreDisplayName from 'pages/common/components/StoreDisplayName'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import BusinessHoursScheduleDisplay from './BusinessHoursScheduleDisplay'
import { DeleteModal } from './DeleteModal'
import LinkedIntegrationsList from './LinkedIntegrationsList'

import css from './ListCustomBusinessHours.less'

type Props = {
    businessHours: BusinessHoursList
}

export default function ListCustomBusinessHoursTableRow({
    businessHours,
}: Props) {
    const [isModalOpen, setModalOpen] = useState(false)
    const { mutate: deleteBusinessHours, isLoading: isDeleting } =
        useDeleteCustomBusinessHours(businessHours)

    const handleDeletion = () => {
        deleteBusinessHours({ id: businessHours.id })
    }

    return (
        <TableBodyRow>
            <BodyCell className={css.nameScheduleColumn}>
                <div className={css.nameScheduleContent}>
                    <Label>{businessHours.name || <i>No name</i>}</Label>
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
                ) : !!businessHours.integration_count ? (
                    <>
                        <Badge
                            type="blue"
                            corner="square"
                            id={`integrations-badge-${businessHours.id}`}
                        >
                            {businessHours.integration_count} integrations
                        </Badge>
                        <Tooltip
                            delay={300}
                            autohide={false}
                            target={`integrations-badge-${businessHours.id}`}
                        >
                            <LinkedIntegrationsList
                                businessHoursId={businessHours.id}
                            />
                        </Tooltip>
                    </>
                ) : (
                    '-'
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
                    <Link
                        to={`/app/settings/business-hours/${businessHours.id}`}
                    >
                        <IconButton
                            icon="edit"
                            intent="secondary"
                            fillStyle="ghost"
                        />
                    </Link>
                    <IconButton
                        icon="delete"
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={() => setModalOpen(true)}
                    />
                </div>
            </BodyCell>
            <DeleteModal
                name={businessHours.name}
                isModalOpen={isModalOpen}
                setModalOpen={setModalOpen}
                onDelete={handleDeletion}
                isDeleting={isDeleting}
            />
        </TableBodyRow>
    )
}
