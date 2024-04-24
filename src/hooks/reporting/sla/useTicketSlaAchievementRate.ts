import {Metric} from 'hooks/reporting/metrics'
import {useTicketsInPolicyPerStatus} from 'hooks/reporting/sla/useTicketsInPolicy'
import useAppSelector from 'hooks/useAppSelector'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {calculatePercentage} from 'utils/reporting'

export const useTicketSlaAchievementRate = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const satisfiedSlaTickets = useTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
    const breachedSlaTickets = useTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )

    const slaAchievementRate =
        satisfiedSlaTickets.data?.value && breachedSlaTickets.data?.value
            ? calculatePercentage(
                  satisfiedSlaTickets.data?.value,
                  satisfiedSlaTickets.data?.value +
                      breachedSlaTickets.data?.value
              )
            : null

    return {
        isFetching:
            satisfiedSlaTickets.isFetching || breachedSlaTickets.isFetching,
        isError: satisfiedSlaTickets.isError || breachedSlaTickets.isError,
        data: {
            value: slaAchievementRate,
        },
    }
}
