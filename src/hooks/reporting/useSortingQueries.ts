import {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {opposite} from 'models/api/types'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {
    getAgentSorting,
    sortingLoaded,
    sortingSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {TableColumn} from 'state/ui/stats/types'

export const useSortingQueries = (column: TableColumn) => {
    const dispatch = useDispatch()

    const userTimezone = useAppSelector((state) => getTimezone(state) || 'UTC')

    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const sorting = useAppSelector(getAgentSorting)
    const {isFetching: frtIsFetching, data: frtData} =
        useFirstResponseTimeMetricPerAgent(
            pageStatsFilters,
            userTimezone,
            sorting?.direction
        )
    const {isFetching: ticketsRepliedIsFetching, data: ticketsRepliedData} =
        useTicketsRepliedMetricPerAgent(
            pageStatsFilters,
            userTimezone,
            sorting?.direction
        )
    const {isFetching: closedTicketsIsFetching, data: closedTicketsData} =
        useClosedTicketsMetricPerAgent(
            pageStatsFilters,
            userTimezone,
            sorting?.direction
        )
    const {isFetching: messagesSentIsFetching, data: messagesSentData} =
        useMessagesSentMetricPerAgent(
            pageStatsFilters,
            userTimezone,
            sorting?.direction
        )
    const {isFetching: resolutionTimeIsFetching, data: resolutionTimeData} =
        useResolutionTimeMetricPerAgent(
            pageStatsFilters,
            userTimezone,
            sorting?.direction
        )
    const {
        isFetching: customerSatisfactionIsFetching,
        data: customerSatisfactionData,
    } = useCustomerSatisfactionMetricPerAgent(
        pageStatsFilters,
        userTimezone,
        sorting?.direction
    )

    const sortCallback = () => {
        dispatch(
            sortingSet({
                field: column,
                direction: opposite(sorting.direction),
            })
        )
    }

    useEffect(() => {
        if (sorting?.field === column && sorting?.isLoading) {
            switch (column) {
                case TableColumn.FirstResponseTime:
                    !frtIsFetching && dispatch(sortingLoaded(frtData?.allData))
                    break
                case TableColumn.RepliedTickets:
                    !ticketsRepliedIsFetching &&
                        dispatch(sortingLoaded(ticketsRepliedData?.allData))
                    break
                case TableColumn.PercentageOfClosedTickets:
                case TableColumn.ClosedTickets:
                    !closedTicketsIsFetching &&
                        dispatch(sortingLoaded(closedTicketsData?.allData))
                    break
                case TableColumn.MessagesSent:
                    !messagesSentIsFetching &&
                        dispatch(sortingLoaded(messagesSentData?.allData))
                    break
                case TableColumn.ResolutionTime:
                    !resolutionTimeIsFetching &&
                        dispatch(sortingLoaded(resolutionTimeData?.allData))
                    break
                case TableColumn.CustomerSatisfaction:
                    !customerSatisfactionIsFetching &&
                        dispatch(
                            sortingLoaded(customerSatisfactionData?.allData)
                        )
                    break
            }
        }
    }, [
        closedTicketsData?.allData,
        closedTicketsIsFetching,
        column,
        customerSatisfactionData?.allData,
        customerSatisfactionIsFetching,
        dispatch,
        frtData,
        frtIsFetching,
        messagesSentData?.allData,
        messagesSentIsFetching,
        resolutionTimeData?.allData,
        resolutionTimeIsFetching,
        sorting?.field,
        sorting?.isLoading,
        ticketsRepliedData?.allData,
        ticketsRepliedIsFetching,
    ])

    return {
        sortCallback,
        direction: sorting.direction,
    }
}
