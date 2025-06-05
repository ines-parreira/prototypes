import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { useFlag } from 'core/flags'
import { StatsNavbarView } from 'pages/stats/common/components/StatsNavbarView/StatsNavbarView'
import StatsNavbarContainer from 'pages/stats/common/StatsNavbarContainer'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/stats/common/components/StatsNavbarView/StatsNavbarView')
const StatsNavbarViewMock = assumeMock(StatsNavbarView)

describe('StatsNavbarContainer', () => {
    beforeEach(() => {
        StatsNavbarViewMock.mockImplementation(() => <div />)
    })

    it('should render StatsNavbarView', () => {
        useFlagMock.mockReturnValue(true)

        renderWithStore(
            <NavBarProvider>
                <StatsNavbarContainer />
            </NavBarProvider>,
            {},
        )

        expect(StatsNavbarViewMock).toHaveBeenCalled()
    })
})
