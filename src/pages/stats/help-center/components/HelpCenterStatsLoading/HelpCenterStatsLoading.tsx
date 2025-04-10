import Loader from 'pages/common/components/Loader/Loader'
import StatsPage from 'pages/stats/common/layout/StatsPage'

import { HELP_CENTER_STATS_TEST_IDS } from '../../pages/tests/constants'

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
