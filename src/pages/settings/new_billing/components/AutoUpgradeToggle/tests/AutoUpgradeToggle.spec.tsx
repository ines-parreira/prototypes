import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {ProductType} from 'models/billing/types'
import {
    basicMonthlyHelpdeskPrice,
    convertPrice1,
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
    })
})
