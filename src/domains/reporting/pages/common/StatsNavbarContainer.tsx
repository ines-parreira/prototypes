import { ActiveContent, Navbar } from 'common/navigation'
import { StatsNavbarView } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavbarView'
import { STATS_NAVBAR_TITLE } from 'domains/reporting/pages/common/constants'

export default function StatsNavbarContainer() {
    return (
        <Navbar
            activeContent={ActiveContent.Statistics}
            title={STATS_NAVBAR_TITLE}
        >
            <StatsNavbarView />
        </Navbar>
    )
}
