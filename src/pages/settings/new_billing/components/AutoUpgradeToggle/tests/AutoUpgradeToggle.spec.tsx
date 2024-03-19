import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {ProductType} from 'models/billing/types'
import {
    basicMonthlyHelpdeskPrice,
    convertPrice1,
    convertPrice5,
    convertProduct,
} from 'fixtures/productPrices'
import {billingState} from 'fixtures/billing'
import AutoUpgradeToggle, {AutoUpgradeToggleProps} from '../AutoUpgradeToggle'

const mockStore = configureMockStore()
const store = mockStore({
    billing: fromJS(billingState),
})

jest.mock('react-router')

describe('AutoUpgradeToggle', () => {
    const mockSetSelectedPlans = jest.fn()

    const selectedPlans = {
        helpdesk: {
            plan: basicMonthlyHelpdeskPrice,
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
            plan: convertPrice1,
            isSelected: true,
        },
    }

    const props: AutoUpgradeToggleProps = {
        type: ProductType.Convert,
        prices: convertProduct.prices,
        selectedPlans,
        setSelectedPlans: mockSetSelectedPlans,
    }

    it('displays the toggle and opens the modal', () => {
        const {getByText, getByRole} = render(
            <Provider store={store}>
                <AutoUpgradeToggle {...props} />
            </Provider>
        )
        expect(getByText('Click allowance auto-upgrade')).toBeInTheDocument()

        getByRole('switch').click()
        expect(mockSetSelectedPlans).toHaveBeenCalled()

        getByRole('button').click()
        expect(
            getByText('Keep your campaigns live at any time!')
        ).toBeInTheDocument()
        expect(getByRole('button', {name: 'Learn more'})).toBeInTheDocument()
        expect(
            getByText(
                'Get automatically upgraded to the next plan if you reach your' +
                    ' click allowance to keep displaying campaigns to your customers.'
            )
        ).toBeInTheDocument()
    })

    it('displays the toggle for enterprise plan', () => {
        const {getByText, queryByRole} = render(
            <Provider store={store}>
                <AutoUpgradeToggle
                    type={props.type}
                    prices={props.prices}
                    selectedPlans={{
                        ...props.selectedPlans,
                        [ProductType.Convert]: {
                            plan: convertPrice5,
                            isSelected: true,
                        },
                    }}
                    setSelectedPlans={props.setSelectedPlans}
                />
            </Provider>
        )
        expect(getByText('Click allowance auto-upgrade')).toBeInTheDocument()
        expect(
            queryByRole('button', {name: 'Learn more'})
        ).not.toBeInTheDocument()
        expect(
            getByText('Auto-upgrade is not available for the selected plan.')
        ).toBeInTheDocument()
    })
})
