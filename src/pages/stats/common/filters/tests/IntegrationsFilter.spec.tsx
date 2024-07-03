import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen} from '@testing-library/react'

import {integrationsState} from 'fixtures/integrations'
import {Integration} from 'models/integration/types'
import {initialState, mergeStatsFilters} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

import {renderWithStore} from 'utils/testing'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import IntegrationsFilter, {
    INTEGRATIONS_FILTER_NAME,
} from 'pages/stats/common/filters/IntegrationsFilter'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

describe('IntegrationsFilter', () => {
    let component: ReturnType<typeof renderWithStore>

    const defaultState = {
        stats: initialState,
    } as RootState

    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i'
    )

    const DROPDOWN_SELECT_VALUE_ELEMENT_TEXT = 'Select value...'
    const {integrations} = integrationsState

    beforeEach(() => {
        component = renderWithStore(
            <IntegrationsFilter
                value={[]}
                integrations={integrations as Integration[]}
            />,
            defaultState
        )
    })

    it('should render IntegrationsFilter component', () => {
        expect(screen.getByText(INTEGRATIONS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render IntegrationsFilter options', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))

        expect(screen.getByText(integrations[0].name)).toBeInTheDocument()
        expect(screen.getByText(integrations[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting an integration', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))
        userEvent.click(screen.getByText(integrations[0].name))
        userEvent.click(screen.getByText(integrations[1].name))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFilters({
                integrations: [integrations[0].id],
            })
        )

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            5,
            mergeStatsFilters({
                integrations: [integrations[1].id],
            })
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all integrations and deselecting all integrations', () => {
        const {rerender} = component
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))
        userEvent.click(screen.getByText(/select all/i))

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id
        )

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFilters({
                integrations: allAvailableIntegrationsIds,
            })
        )

        rerender(
            <IntegrationsFilter
                value={allAvailableIntegrationsIds}
                integrations={integrations as Integration[]}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(/deselect all/i))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            6,
            mergeStatsFilters({
                integrations: [],
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the integrations', () => {
        const {rerender} = component

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id
        )

        rerender(
            <IntegrationsFilter
                value={allAvailableIntegrationsIds}
                integrations={integrations as Integration[]}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(integrations[0].name))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            4,
            mergeStatsFilters({
                integrations: allAvailableIntegrationsIds.filter(
                    (channel) => channel !== integrations[0].id
                ),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const {rerender} = component
        const clearFilterIcon = 'close'

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id
        )

        rerender(
            <IntegrationsFilter
                value={allAvailableIntegrationsIds}
                integrations={integrations as Integration[]}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFilters({
                integrations: [],
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i')
        )
        const isOneOfRadioInput = document.querySelector(
            `input[id=${LogicalOperatorEnum.ONE_OF}]`
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
        )
        const isNotOneOfRadioInput = document.querySelector(
            `input[id=${LogicalOperatorEnum.NOT_ONE_OF}]`
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(isOneOfRadioInput).not.toBeChecked()
        expect(isNotOneOfRadioInput).toBeChecked()

        userEvent.click(isOneOfRadioLabel)

        expect(isOneOfRadioInput).toBeChecked()
        expect(isNotOneOfRadioInput).not.toBeChecked()
    })
})
