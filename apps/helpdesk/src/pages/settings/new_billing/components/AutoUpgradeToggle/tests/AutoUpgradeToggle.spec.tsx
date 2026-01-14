import React from 'react'

import { userEvent } from '@repo/testing'
import { render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { billingState } from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    convertPlan5,
    convertProduct,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import type { AutoUpgradeToggleProps } from '../AutoUpgradeToggle'
import AutoUpgradeToggle from '../AutoUpgradeToggle'

const mockStore = configureMockStore()
const store = mockStore({
    billing: fromJS(billingState),
})

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

describe('AutoUpgradeToggle', () => {
    const mockSetSelectedPlans = jest.fn()

    const selectedPlans = {
        helpdesk: {
            plan: basicMonthlyHelpdeskPlan,
            isSelected: true,
        },
        automation: {
            isSelected: false,
        },
        voice: {
            isSelected: false,
        },
        sms: {
            isSelected: false,
        },
        convert: {
            plan: convertPlan1,
            isSelected: true,
        },
    }

    const props: AutoUpgradeToggleProps = {
        type: ProductType.Convert,
        availablePlans: convertProduct.prices,
        selectedPlans,
        setSelectedPlans: mockSetSelectedPlans,
    }

    it('displays the toggle and opens the modal', async () => {
        const { getByText, getByRole } = render(
            <Provider store={store}>
                <AutoUpgradeToggle {...props} />
            </Provider>,
        )
        expect(getByText('Click allowance auto-upgrade')).toBeInTheDocument()

        await userEvent.click(getByRole('switch'))

        await waitFor(() => {
            expect(mockSetSelectedPlans).toHaveBeenCalled()
        })

        await userEvent.click(getByRole('button'))
        await waitFor(() => {
            expect(
                getByText('Keep your campaigns live at any time!'),
            ).toBeInTheDocument()
            expect(
                getByRole('button', { name: 'Learn more' }),
            ).toBeInTheDocument()
            expect(
                getByText(
                    'Get automatically upgraded to the next plan if you reach your' +
                        ' click allowance to keep displaying campaigns to your customers.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('displays the toggle for enterprise plan', () => {
        const { getByText, queryByRole } = render(
            <Provider store={store}>
                <AutoUpgradeToggle
                    type={props.type}
                    availablePlans={props.availablePlans}
                    selectedPlans={{
                        ...props.selectedPlans,
                        [ProductType.Convert]: {
                            plan: convertPlan5,
                            isSelected: true,
                        },
                    }}
                    setSelectedPlans={props.setSelectedPlans}
                />
            </Provider>,
        )
        expect(getByText('Click allowance auto-upgrade')).toBeInTheDocument()
        expect(
            queryByRole('button', { name: 'Learn more' }),
        ).not.toBeInTheDocument()
        expect(
            getByText('Auto-upgrade is not available for the selected plan.'),
        ).toBeInTheDocument()
    })
})
