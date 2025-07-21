import React from 'react'

import { render } from '@testing-library/react'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { PerformanceByArticle } from 'domains/reporting/pages/help-center/components/PerformanceByArticle/PerformanceByArticle'
import { PerformanceByArticleChart } from 'domains/reporting/pages/help-center/components/PerformanceByArticle/PerformanceByArticleChart'
import { useSelectedHelpCenter } from 'domains/reporting/pages/help-center/hooks/useSelectedHelpCenter'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/help-center/hooks/useSelectedHelpCenter')
const useSelectedHelpCenterMock = assumeMock(useSelectedHelpCenter)
jest.mock(
    'domains/reporting/pages/help-center/components/PerformanceByArticle/PerformanceByArticle',
)
const PerformanceByArticleMock = assumeMock(PerformanceByArticle)
jest.mock('domains/reporting/pages/common/components/NoDataAvailable')
const NoDataAvailableMock = assumeMock(NoDataAvailable)

describe('PerformanceByArticleChart', () => {
    const helpCenterId = 45
    const helpCenterDomain = 'someDomain.com'

    beforeEach(() => {
        PerformanceByArticleMock.mockImplementation(() => <div />)
        NoDataAvailableMock.mockImplementation(() => <div />)
    })

    it('renders PerformanceByArticle when domain is selected', () => {
        useSelectedHelpCenterMock.mockReturnValue({
            selectedHelpCenterDomain: helpCenterDomain,
            helpCenterId,
        } as unknown as ReturnType<typeof useSelectedHelpCenterMock>)
        render(<PerformanceByArticleChart />)

        expect(PerformanceByArticleMock).toHaveBeenCalled()
    })

    it('renders No Data component when domain is not selected', () => {
        useSelectedHelpCenterMock.mockReturnValue({
            selectedHelpCenterDomain: undefined,
            helpCenterId,
        } as unknown as ReturnType<typeof useSelectedHelpCenterMock>)

        render(<PerformanceByArticleChart />)

        expect(NoDataAvailableMock).toHaveBeenCalled()
    })
})
