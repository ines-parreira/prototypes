import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import storefront from 'assets/img/icons/storefront.svg'

import {StoreRadioButton, StoreRadioButtonProps} from '../StoreRadioButton'

const onClickFn = jest.fn()

const baseProps: StoreRadioButtonProps = {
    icon: <img src={storefront} alt="storefront" />,
    label: 'Shopify Store',
    tooltipText:
        "By connecting your live chat to an online store, you can leverage all the store's information for automation such as self-service flows and help articles.",
    isSelected: false,
    onClick: onClickFn,
}

describe('<StoreRadioButton />', () => {
    it('matches snapshot', () => {
        const {container} = render(<StoreRadioButton {...baseProps} />)
        expect(container).toMatchSnapshot()
    })
    it('has the selected className if isSelected is true', () => {
        const {getByRole} = render(
            <StoreRadioButton {...baseProps} isSelected />
        )
        expect(getByRole('button').className.includes('selected')).toBeTruthy()
    })
    it('renders the proper icon', () => {
        const {getByAltText} = render(<StoreRadioButton {...baseProps} />)
        getByAltText('storefront')
    })
    it('displays the tooltip on hover', () => {
        const {getByRole, getByText} = render(
            <StoreRadioButton {...baseProps} />
        )
        fireEvent.mouseEnter(getByRole('button'))
        void waitFor(() => getByText(baseProps.tooltipText))
    })
    it('has the on click event listener', () => {
        const {getByRole} = render(<StoreRadioButton {...baseProps} />)
        fireEvent.click(getByRole('button'))
        expect(onClickFn).toHaveBeenCalled()
    })
})
