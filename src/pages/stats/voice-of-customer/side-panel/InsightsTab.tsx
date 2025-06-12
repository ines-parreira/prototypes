import { useRef, useState } from 'react'

import classnames from 'classnames'
import _isEmpty from 'lodash/isEmpty'

import { Button } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerIntentForProduct } from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import {
    INTENT_DIMENSION,
    TicketPerIntentSortingField,
    TicketsPerIntentOrderField,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Dropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import IconInput from 'pages/common/forms/input/IconInput'
import { LoadingSkeleton } from 'pages/stats/common/components/IntentCard'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { L3IntentCard } from 'pages/stats/voice-of-customer/components/L3IntentCard'
import css from 'pages/stats/voice-of-customer/side-panel/InsightsTab.less'
import { formatDateRange } from 'pages/stats/voice-of-customer/utils'
import {
    getSidePanelProduct,
    SidePanelProduct,
} from 'state/ui/stats/sidePanelSlice'

export const NUMBER_PLACEHOLDER_ITEMS = 3

const LoadingFallback = ({ length }: { length: number }) => (
    <ul className={classnames(css.list, css.intentList)}>
        {Array.from({ length }, (_, index) => (
            <li key={index}>
                <LoadingSkeleton />
            </li>
        ))}
    </ul>
)

export const DATA_MISSING_MESSAGE = 'No data for the selected period.'
const NoDataFallback = () => <div>{DATA_MISSING_MESSAGE}</div>

type SortingOption = {
    label: string
    field: TicketsPerIntentOrderField
    direction: OrderDirection
}

const valueOf = (option: SortingOption) => option.label

const SelectSorting = ({
    value,
    onChange,
    options,
}: {
    value: SortingOption
    onChange: (option: SortingOption) => void
    options: SortingOption[]
}) => {
    const triggerRef = useRef<HTMLButtonElement>(null)

    return (
        <>
            <Button
                ref={triggerRef}
                intent="secondary"
                fillStyle="ghost"
                trailingIcon={<IconInput icon="arrow_drop_down" />}
            >
                Order by
            </Button>
            <Dropdown
                target={triggerRef}
                placement="bottom-end"
                value={valueOf(value)}
            >
                <DropdownBody>
                    <ul className={css.list}>
                        {options.map((option) => (
                            <DropdownItem
                                key={option.label}
                                className={css.option}
                                onClick={() => onChange(option)}
                                shouldCloseOnSelect
                                option={{
                                    label: option.label,
                                    value: valueOf(option),
                                }}
                            />
                        ))}
                    </ul>
                </DropdownBody>
            </Dropdown>
        </>
    )
}

export const sortingOptions: SortingOption[] = [
    {
        label: 'Sort ascending (A-Z)',
        field: TicketPerIntentSortingField.CustomFieldValueString,
        direction: OrderDirection.Asc,
    },
    {
        label: 'Sort descending (Z-A)',
        field: TicketPerIntentSortingField.CustomFieldValueString,
        direction: OrderDirection.Desc,
    },
    {
        label: 'Highest ticket quantity',
        field: TicketPerIntentSortingField.TicketCount,
        direction: OrderDirection.Asc,
    },
    {
        label: 'Lowest ticket quantity',
        field: TicketPerIntentSortingField.TicketCount,
        direction: OrderDirection.Desc,
    },
]

const useSelectedProduct = () => {
    return useAppSelector(getSidePanelProduct)
}

const InsightsTabContent = ({
    intentCustomFieldId,
    product,
}: {
    intentCustomFieldId: number
    product: SidePanelProduct
}) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const [sorting, setSorting] = useState<SortingOption>(sortingOptions[0])
    const { direction, field } = sorting

    const ticketCountPerIntentForProduct = useTicketCountPerIntentForProduct(
        cleanStatsFilters,
        userTimezone,
        intentCustomFieldId,
        product.id,
        direction,
        undefined,
        field,
    )

    const items = ticketCountPerIntentForProduct.data?.allData || []

    const isLoading = ticketCountPerIntentForProduct.isFetching
    const isEmpty = _isEmpty(items)

    const formattedPeriod = formatDateRange(
        cleanStatsFilters.period.start_datetime,
        cleanStatsFilters.period.end_datetime,
        userTimezone,
    )

    const tooltip = `Top insights on products based on ticket quantity. Delta shows change in ticket volume from ${formattedPeriod}.`

    return (
        <>
            <DashboardSection className={css.headerWrapper}>
                <DashboardGridCell>
                    <div className={css.header}>
                        <h3 className={css.heading}>
                            Trending insights <HintTooltip title={tooltip} />
                        </h3>
                        <SelectSorting
                            value={sorting}
                            onChange={setSorting}
                            options={sortingOptions}
                        />
                    </div>
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection>
                <DashboardGridCell>
                    {isLoading ? (
                        <LoadingFallback length={NUMBER_PLACEHOLDER_ITEMS} />
                    ) : isEmpty ? (
                        <NoDataFallback />
                    ) : (
                        <ul className={classnames(css.list, css.intentList)}>
                            {items.map((item) => {
                                const intent = item[INTENT_DIMENSION]

                                if (!intent) return null

                                return (
                                    <li key={intent}>
                                        <L3IntentCard
                                            intent={intent}
                                            product={product}
                                            intentCustomFieldId={
                                                intentCustomFieldId
                                            }
                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </DashboardGridCell>
            </DashboardSection>
        </>
    )
}

const isInvalidId = (id: number) => id === TICKET_FIELD_ID_NOT_AVAILABLE

export const InsightsTab = () => {
    const product = useSelectedProduct()

    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    if (!product || isInvalidId(intentCustomFieldId)) return null

    return (
        <InsightsTabContent
            intentCustomFieldId={intentCustomFieldId}
            product={product}
        />
    )
}
