import {render} from '@testing-library/react'
import React from 'react'

import {PerformanceByArticle} from 'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticle'
import {PerformanceByArticleChart} from 'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticleChart'
import {useSelectedHelpCenter} from 'pages/stats/help-center/hooks/useSelectedHelpCenter'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/help-center/hooks/useSelectedHelpCenter')
const useSelectedHelpCenterMock = assumeMock(useSelectedHelpCenter)
jest.mock(
    'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticle'
)
const PerformanceByArticleMock = assumeMock(PerformanceByArticle)
jest.mock('pages/stats/NoDataAvailable')
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
