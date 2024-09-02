import React from 'react'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HelpCenterFilter, {
    HelpCenterFilterWithState,
} from 'pages/stats/common/filters/HelpCenterFilter'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithStore} from 'utils/testing'
import {HelpCenter} from 'models/helpCenter/types'
import {RootState} from 'state/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {initialState} from 'state/stats/statsSlice'
import {FilterKey} from 'models/stat/types'
import {FilterLabels} from 'pages/stats/common/filters/constants'

const mockedHelpCenterData = getHelpCentersResponseFixture.data
const HELP_CENTER_FILTER_NAME = FilterLabels[FilterKey.HelpCenters]

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

describe('HelpCenterFilter', () => {
    const mockStore = {
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: mockedHelpCenterData.reduce(
                        (acc: Record<string, HelpCenter>, hCenter) => {
                            acc[hCenter.id] = hCenter
                            return acc
                        },
                        {}
                    ),
                },
            },
        },
    } as RootState

    it('should render HelpCenterFilter component', () => {
        renderWithStore(
            <HelpCenterFilter value={withDefaultLogicalOperator([])} />,
            mockStore
        )
        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render HelpCenterFilter component as usual with no value provided', () => {
        renderWithStore(<HelpCenterFilter value={undefined} />, mockStore)
        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render HelpCenterFilter component without selected help center', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
            />,
            mockStore
        )

        expect(screen.getByText(HELP_CENTER_FILTER_NAME)).toBeInTheDocument()
        expect(
            screen.getByText(mockedHelpCenterData[0].name)
        ).toBeInTheDocument()
    })

    it('should check if HelpCenterFilter component is calling dispatch mergeStatsFilters with correct params', () => {
        renderWithStore(
            <HelpCenterFilter
                value={withDefaultLogicalOperator([mockedHelpCenterData[0].id])}
            />,
            mockStore
        )

        userEvent.click(
            screen.getByText(getHelpCentersResponseFixture.data[0].name)
        )

        userEvent.click(
            screen.getByText(getHelpCentersResponseFixture.data[1].name)
        )

        expect(mockedDispatch).toHaveBeenCalledWith({
            payload: {
                helpCenters: withDefaultLogicalOperator([
                    getHelpCentersResponseFixture.data[1].id,
                ]),
            },
            type: 'stats/mergeStatsFiltersWithLogicalOperator',
        })
    })

    it('should render the HelpCenterFilterWithState and reflect the value coming from store', () => {
        const mockedStoreWithHelpCenterFilters = {
            ...mockStore,
            stats: {
                filters: {
                    ...initialState.filters,
                    helpCenters: withDefaultLogicalOperator([
                        getHelpCentersResponseFixture.data[0].id,
                    ]),
                },
            },
        }

        renderWithStore(
            <HelpCenterFilterWithState />,
            mockedStoreWithHelpCenterFilters
        )

        expect(
            screen.getByText(getHelpCentersResponseFixture.data[0].name)
        ).toBeInTheDocument()
    })
})
