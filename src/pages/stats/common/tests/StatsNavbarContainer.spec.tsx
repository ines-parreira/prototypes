import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { useFlag } from 'core/flags'
import StatsNavbarView from 'pages/stats/common/components/StatsNavbarView'
import { StatsNavbarViewV2 } from 'pages/stats/common/components/StatsNavbarViewV2/StatsNavbarViewV2'
import StatsNavbarContainer from 'pages/stats/common/StatsNavbarContainer'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/stats/common/components/StatsNavbarView')
const StatsNavbarViewMock = assumeMock(StatsNavbarView)

jest.mock('pages/stats/common/components/StatsNavbarViewV2/StatsNavbarViewV2')
const StatsNavbarViewV2Mock = assumeMock(StatsNavbarViewV2)

describe('StatsNavbarContainer', () => {
    beforeEach(() => {
        StatsNavbarViewMock.mockImplementation(() => <div />)
        StatsNavbarViewV2Mock.mockImplementation(() => <div />)
    })

    it('should render legacy StatsNavbarView', () => {
        useFlagMock.mockReturnValue(false)

        renderWithStore(
            <NavBarProvider>
                <StatsNavbarContainer />
            </NavBarProvider>,
            {},
        )

        expect(StatsNavbarViewMock).toHaveBeenCalled()
    })

    it('should render V2 StatsNavbarView when the feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        renderWithStore(
            <NavBarProvider>
                <StatsNavbarContainer />
            </NavBarProvider>,
            {},
        )

        expect(StatsNavbarViewV2Mock).toHaveBeenCalled()
    })
})
