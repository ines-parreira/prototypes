import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { HELP_CENTER_STATS_TEST_IDS } from 'domains/reporting/pages/help-center/pages/tests/constants'
import Loader from 'pages/common/components/Loader/Loader'

type HelpCenterStatsLoadingProps = {
    title: string
}

const HelpCenterStatsLoading = ({ title }: HelpCenterStatsLoadingProps) => (
    <div className="full-width">
        <StatsPage title={title} titleExtra={<></>}>
            <Loader
                size="24px"
                data-testid={HELP_CENTER_STATS_TEST_IDS.LOADER}
            />
        </StatsPage>
    </div>
)

export default HelpCenterStatsLoading
