import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import {StoreRadioButton} from '../StoreRadioButton'

const onClickFn = jest.fn()

jest.mock('lodash/uniqueId', () => () => '42')

const baseProps = {
    label: 'Shopify Store',
    value: 'shopify',
    tooltipText:
        "By connecting your live chat to an online store, you can leverage all the store's information for automation such as self-service flows and help articles.",
    isSelected: false,
    onClick: onClickFn,
}

describe('<StoreRadioButton />', () => {
    it('should match snapshot', () => {
        const {container} = render(<StoreRadioButton {...baseProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should display the tooltip on hover', () => {
        const {container, getByText} = render(
            <StoreRadioButton {...baseProps} />
        )
        fireEvent.mouseEnter(container.firstChild as HTMLElement)
        void waitFor(() => getByText(baseProps.tooltipText))
    })
})
