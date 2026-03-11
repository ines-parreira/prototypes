import { useMemo, useState } from 'react'

import { FormField, useFormContext } from '@repo/forms'
import { useDebouncedValue } from '@repo/hooks'
import cn from 'classnames'

import {
    LegacyBadge as Badge,
    LegacyBanner as Banner,
    Box,
    LegacyCheckBoxField as CheckBoxField,
    Skeleton,
} from '@gorgias/axiom'
import type { ListIntegrationsForBusinessHoursOrderBy } from '@gorgias/helpdesk-queries'
import { useListIntegrationsForBusinessHours } from '@gorgias/helpdesk-queries'

import type { OrderDirection } from 'models/api/types'
import { IntegrationType } from 'models/integration/types'
import ChannelFilter from 'pages/common/components/ChannelFilter/ChannelFilter'
import Navigation from 'pages/common/components/Navigation/Navigation'
import { SearchBar } from 'pages/common/components/SearchBar/SearchBar'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { useCustomBusinessHoursContext } from './CustomBusinessHoursContext'
import IntegrationRowsField from './IntegrationRowsField'
import StoreFilter from './StoreFilter'
import type {
    BusinessHoursCreateFormValues,
    EditCustomBusinessHoursFormValues,
} from './types'

import css from './CustomBusinessHoursIntegrationsTable.less'

type Props = {
    name?:
        | 'temporary_assigned_integrations'
        | 'assigned_integrations.assign_integrations'
}

const BUSINESS_HOURS_CHANNEL_INTEGRATION_TYPES = [
    IntegrationType.Email,
    IntegrationType.Aircall,
    IntegrationType.Facebook,
    IntegrationType.Phone,
    IntegrationType.Sms,
    IntegrationType.WhatsApp,
    IntegrationType.GorgiasChat,
    IntegrationType.Twitter,
    IntegrationType.App,
]

export default function CustomBusinessHoursIntegrationsTable({
    name = 'assigned_integrations.assign_integrations',
}: Props) {
    const [cursor, setCursor] = useState<string>()
    const [order_by, setOrderBy] =
        useState<ListIntegrationsForBusinessHoursOrderBy>()
    const direction = useMemo(() => order_by?.split(':')?.[1], [order_by])
    const sortBy = useMemo(() => order_by?.split(':')?.[0], [order_by])

    const [nameSearch, setNameSearch] = useState<string>()
    const [channels, setChannels] = useState<string[] | null>(null)
    const [storeId, setStoreId] = useState<number | null>(null)

    const debouncedNameSearch = useDebouncedValue(nameSearch, 300)

    const {
        businessHoursId,
        integrationsToOverride,
        toggleIntegrationsToOverride,
        resetIntegrationsToOverride,
    } = useCustomBusinessHoursContext()

    const { data, isLoading, isError, refetch } =
        useListIntegrationsForBusinessHours({
            order_by,
            ...(order_by ? {} : { cursor }),
            name_search: debouncedNameSearch ? debouncedNameSearch : undefined,
            channels: channels ? channels : undefined,
            store_id: storeId ? storeId : undefined,
            target_business_hours_id: businessHoursId
                ? businessHoursId
                : undefined,
        })
    const integrations = data?.data.data

    const { watch, setValue } = useFormContext<
        BusinessHoursCreateFormValues | EditCustomBusinessHoursFormValues
    >()

    const assignIntegrations = watch(name)
    const isAllSelected =
        (integrations &&
            integrations.length > 0 &&
            !!integrations.every((integration) =>
                assignIntegrations.includes(integration.integration_id),
            )) ||
        false

    const handleSelectAll = (value: boolean) => {
        const newAssignIntegrationsSet = new Set(assignIntegrations)

        if (!integrations) {
            return
        }

        integrations.forEach((integration) => {
            if (value) {
                newAssignIntegrationsSet.add(integration.integration_id)
            } else {
                newAssignIntegrationsSet.delete(integration.integration_id)
            }
        })

        toggleIntegrationsToOverride(integrations, value)

        setValue(name, Array.from(newAssignIntegrationsSet))
    }

    const updateCursor = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            !!data?.data.meta.next_cursor &&
                setCursor(data.data.meta.next_cursor)
        } else {
            !!data?.data.meta.prev_cursor &&
                setCursor(data.data.meta.prev_cursor)
        }
    }

    const handleSortChange = () => {
        if (!order_by) {
            setOrderBy('name:asc')
        } else if (order_by === 'name:asc') {
            setOrderBy('name:desc')
        } else {
            setOrderBy(undefined)
        }
    }

    const clearSelectedIntegrations = () => {
        setValue(name, [])
        resetIntegrationsToOverride()
    }

    return (
        <Box gap="md" flexDirection="column">
            <Box justifyContent="space-between">
                <div>
                    {!!assignIntegrations.length && (
                        <Badge type="blue" corner="square">
                            {assignIntegrations.length} integration
                            {assignIntegrations.length > 1 ? 's' : ''} selected
                            <i
                                className={cn(css.closeIcon, 'material-icons')}
                                onClick={clearSelectedIntegrations}
                            >
                                close
                            </i>
                        </Badge>
                    )}
                </div>
                <div className={css.filters}>
                    <div className={css.searchBar}>
                        <SearchBar
                            placeholder="Search integrations"
                            onChange={setNameSearch}
                        />
                    </div>
                    <StoreFilter onChange={setStoreId} />
                    <ChannelFilter
                        channels={BUSINESS_HOURS_CHANNEL_INTEGRATION_TYPES}
                        onChange={setChannels}
                        withSearch
                    />
                </div>
            </Box>
            <div className={css.wrapper}>
                <TableWrapper className={css.table}>
                    <TableHead>
                        <HeaderCell size="smallest">
                            <CheckBoxField
                                value={isAllSelected}
                                aria-label="Select all integrations"
                                isDisabled={
                                    isLoading || integrations?.length === 0
                                }
                                onChange={handleSelectAll}
                            />
                        </HeaderCell>
                        <HeaderCell className={css.overrideColumn} />
                        <HeaderCellProperty
                            className={css.integrationNameColumn}
                            direction={direction as OrderDirection}
                            isOrderedBy={sortBy === 'name'}
                            onClick={handleSortChange}
                            title="Integration"
                        />
                        <HeaderCell
                            size="normal"
                            className={css.storeNameColumn}
                        >
                            Store
                        </HeaderCell>
                        <HeaderCell
                            size="normal"
                            className={css.businessHoursColumn}
                        >
                            Business hours
                        </HeaderCell>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }, (_, key) => (
                                <RowSkeleton key={key} />
                            ))
                        ) : (
                            <FormField
                                name={name}
                                field={IntegrationRowsField}
                                integrations={integrations}
                                isError={isError}
                                refetch={refetch}
                            />
                        )}
                    </TableBody>
                    {!isLoading && (
                        <Navigation
                            className={css.pagination}
                            hasNextItems={!!data?.data.meta.next_cursor}
                            hasPrevItems={!!data?.data.meta.prev_cursor}
                            fetchNextItems={() => updateCursor('next')}
                            fetchPrevItems={() => updateCursor('prev')}
                        />
                    )}
                </TableWrapper>
            </div>
            {integrationsToOverride.length > 0 && (
                <Banner type="warning">
                    <Box flexDirection="column" gap="xs">
                        <div>
                            {integrationsToOverride.length} of the selected
                            integrations are already assigned to other custom
                            business hour schedules. Assigning them to this
                            custom business hour schedule will overwrite their
                            existing schedules.
                        </div>
                        <FormField
                            name="overrideConfirmation"
                            field={CheckBoxField}
                            label="I confirm overwriting the existing schedules"
                        />
                    </Box>
                </Banner>
            )}
        </Box>
    )
}

const RowSkeleton = () => (
    <TableBodyRow>
        <BodyCell>
            <CheckBoxField isDisabled value={false} />
        </BodyCell>
        <BodyCell />
        <BodyCell className={css.integrationNameColumn}>
            <Skeleton width={208} />
        </BodyCell>
        <BodyCell className={css.storeNameColumn}>
            <Skeleton width={208} />
        </BodyCell>
        <BodyCell className={css.businessHoursColumn}>
            <Skeleton width={288} />
        </BodyCell>
    </TableBodyRow>
)
