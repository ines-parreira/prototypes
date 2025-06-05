import { ActiveContent, Navbar } from 'common/navigation'

import { StatsNavbarView } from './components/StatsNavbarView/StatsNavbarView'

export default function StatsNavbarContainer() {
    return (
        <Navbar activeContent={ActiveContent.Statistics} title="Statistics">
            <StatsNavbarView />
        </Navbar>
    )
}
