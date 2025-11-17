import type { ComponentProps } from 'react'
import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import SearchQueryModal from 'domains/reporting/pages/help-center/components/SearchQueryModal/SearchQueryModal'

jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))

const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const renderComponent = (
    props: Partial<ComponentProps<typeof SearchQueryModal>>,
) => {
    render(
        <Provider store={store}>
            <SearchQueryModal
                onClose={jest.fn()}
                statsFilters={{
                    period: {
                        start_datetime: '2021-05-29T00:00:00+02:00',
                        end_datetime: '2021-06-04T23:59:59+02:00',
                    },
                }}
                timezone=""
                searchQuery=""
                articlesCount={0}
                helpCenterDomain="acme"
                {...props}
            />
        </Provider>,
    )
}

describe('<SearchQueryModal />', () => {
    beforeEach(() => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [],
                decile: null,
            },
        })
    })

    it('should render', () => {
        renderComponent({ searchQuery: 'test' })

        expect(screen.getByText('test')).toBeInTheDocument()
    })

    it('should open the modal when clicks on article count', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.ArticleTitle]:
                            'How to report an issue',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount]:
                            '5',
                    },
                ],
                decile: null,
            },
        })

        renderComponent({})

        expect(screen.getByTestId('Clicks-0')).toHaveTextContent('5')
        expect(screen.getByTestId('Article clicked-0')).toHaveTextContent(
            'How to report an issue',
        )
    })
})
