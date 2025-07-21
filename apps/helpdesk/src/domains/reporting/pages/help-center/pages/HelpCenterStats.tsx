import { logEvent, SegmentEvent } from 'common/segment'
import { HelpCenterReport } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReport'
import { HelpCenterReportConfig } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import { HelpCenterStatsEmptyState } from 'domains/reporting/pages/help-center/components/HelpCenterStatsEmptyState/HelpCenterStatsEmptyState'
import HelpCenterStatsLoading from 'domains/reporting/pages/help-center/components/HelpCenterStatsLoading/HelpCenterStatsLoading'
import { useSelectedHelpCenter } from 'domains/reporting/pages/help-center/hooks/useSelectedHelpCenter'
import { isHelpCenterStatsFiltersValid } from 'domains/reporting/pages/help-center/types'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isNotEmptyArray } from 'utils'

const HelpCenterStats = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    useEffectOnce(() => {
        logEvent(SegmentEvent.HelpCenterStatisticsPageViewed, {
            user_id: currentUser.get('id'),
            account_domain: currentAccount.get('domain'),
        })
    })

    const {
        isLoading,
        statsFilters,
        activeHelpCenters,
        sortedHelpCenters,
        helpCenters,
    } = useSelectedHelpCenter()

    if (isLoading || !isHelpCenterStatsFiltersValid(statsFilters)) {
        return (
            <HelpCenterStatsLoading title={HelpCenterReportConfig.reportName} />
        )
    }

    return activeHelpCenters.length > 0 &&
        isNotEmptyArray(sortedHelpCenters) ? (
        <HelpCenterReport />
    ) : (
        <HelpCenterStatsEmptyState
            helpCenterId={
                helpCenters.length === 1 ? helpCenters[0].id : undefined
            }
        />
    )
}

export default HelpCenterStats
