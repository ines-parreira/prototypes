import React from 'react'
import {screen} from '@testing-library/react'

import {assumeMock, renderWithStore} from 'utils/testing'
import {useTagsDistribution} from 'pages/stats/useTagsDistribution'

import {RootState} from 'state/types'
import {initialState} from 'state/stats/statsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {
    TopUsedTagsChart,
    TAGS_CARD_TITLE,
} from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'

jest.mock('pages/stats/useTagsDistribution')
const useTagsDistributionMock = assumeMock(useTagsDistribution)

const useTagsDistributionReturnValue = {
    data: [
        {
            category: '255148',
            value: 1,
            valueInPercentage: 20,
            previousValueInPercentage: 40,
            gaugePercentage: 50,
            name: 'basic',
        },
        {
            category: '487270',
            value: 2,
            valueInPercentage: 5,
            previousValueInPercentage: 5,
            gaugePercentage: 0,
            name: '3-app/aftership',
        },
        {
            category: '261197',
            value: 3,
            valueInPercentage: 25,
            previousValueInPercentage: 5,
            gaugePercentage: 400,
            name: 'customer',
        },
    ],
    isFetching: false,
}

const mockStore = {
    stats: initialState,
    ui: {
        stats: uiStatsInitialState,
    },
} as RootState

describe('<TopUsedTagsChart/>', () => {
    beforeEach(() => {
        useTagsDistributionMock.mockReturnValue(useTagsDistributionReturnValue)
    })

    it('should render the table', () => {
        renderWithStore(<TopUsedTagsChart />, mockStore)

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getByText(TAGS_CARD_TITLE)).toBeInTheDocument()
    })

    it('should render the sekelton when loading', () => {
        useTagsDistributionMock.mockReturnValue({
            data: [],
            isFetching: true,
        })
        const {container} = renderWithStore(<TopUsedTagsChart />, mockStore)
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(container.getElementsByClassName('skeleton')).not.toHaveLength(0)
    })

    it('should render no data', () => {
        useTagsDistributionMock.mockReturnValue({
            data: [],
            isFetching: false,
        })
        renderWithStore(<TopUsedTagsChart />, mockStore)
        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should render all the columns name', () => {
        renderWithStore(<TopUsedTagsChart />, mockStore)

        expect(screen.getByText('Tags')).toBeInTheDocument()
        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(screen.getByText('Delta')).toBeInTheDocument()
    })

    it('should render all the tags values', () => {
        renderWithStore(<TopUsedTagsChart />, mockStore)

        useTagsDistributionReturnValue.data.forEach((value) => {
            expect(screen.getByText(value.name)).toBeInTheDocument()
            expect(screen.getByText(value.value)).toBeInTheDocument()
            expect(
                screen.getByText(`${value.gaugePercentage}%`)
            ).toBeInTheDocument()
        })
    })
})
