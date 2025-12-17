import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { StatsNavbarView } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavbarView'
import StatsNavbarContainer from 'domains/reporting/pages/common/StatsNavbarContainer'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock(
    'domains/reporting/pages/common/components/StatsNavbarView/StatsNavbarView',
)
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
