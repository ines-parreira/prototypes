import React, {ComponentType} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'

import {StatsPageContainer} from '../StatsPage'
import {renderWithRouter} from '../../../utils/testing'

jest.mock('moment-timezone', () => () => {
    const moment: (
        date: string
    ) => Record<string, unknown> = jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

jest.mock(
    '../../common/utils/withPaywall',
    () => () => (Component: ComponentType<any>) => () => {
        return <Component />
    }
)

const mockUseParams = useParams
jest.mock('../StatsComponent', () => () => {
    const {view} = mockUseParams<{view?: string}>()
    return <div>Stats Component: {view}</div>
})

jest.mock('../RevenueStats', () => () => <div>Revenue Stats Component</div>)

describe('StatsPage', () => {
    const defaultProps = {
        config: fromJS({}),
        globalFilters: null,
        setStatsFilters: jest.fn(),
        resetStatsFilters: jest.fn(),
        userTimezone: 'America/Los_Angeles',
    }

    describe('testing default filters', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should ensure the default value', () => {
            renderWithRouter(
                <StatsPageContainer
                    {...defaultProps}
                    userTimezone={undefined}
                />,
                {
                    path: '/:view',
                    route: `/satisfaction`,
                }
            )
            expect(defaultProps.setStatsFilters).toMatchSnapshot()
        })

        it("should ensure the default period is using user's timezone", () => {
            renderWithRouter(
                <StatsPageContainer
                    {...defaultProps}
                    userTimezone="Europe/Paris"
                />,
                {
                    path: '/:view',
                    route: `/satisfaction`,
                }
            )
            expect(defaultProps.setStatsFilters).toMatchSnapshot()
        })
    })

    it('should ensure that on component unmount we reset the stats filters', () => {
        const {unmount} = renderWithRouter(
            <StatsPageContainer {...defaultProps} />,
            {
                path: '/:view',
                route: `/satisfaction`,
            }
        )
        unmount()
        expect(defaultProps.resetStatsFilters).toHaveBeenCalled()
    })

    it('should render "Satisfaction" statistics', () => {
        const {container} = renderWithRouter(
            <StatsPageContainer {...defaultProps} globalFilters={fromJS({})} />,
            {
                path: '/:view',
                route: `/satisfaction`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render "Revenue" statistics', () => {
        const {container} = renderWithRouter(
            <StatsPageContainer
                {...defaultProps}
                globalFilters={fromJS({integrations: [1]})}
            />,
            {
                path: '/:view',
                route: `/revenue`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render statistics because there is no filter', () => {
        const {container} = renderWithRouter(
            <StatsPageContainer {...defaultProps} globalFilters={null} />,
            {
                path: '/:view',
                route: `/overview`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render "Overview" statistics', () => {
        const {container} = renderWithRouter(
            <StatsPageContainer
                {...defaultProps}
                globalFilters={fromJS({agents: [1, 2]})}
            />,
            {
                path: '/:view',
                route: `/overview`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
