import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import ProductAutomations from '../ProductAutomations'

describe('ProductAutomations', () => {
    it('should render the component', () => {
        const {getByText, queryByText} = render(
            <ProductAutomations
                productAutomationClicked={jest.fn()}
                onClick={jest.fn()}
                onBackClicked={jest.fn()}
            />
        )

        expect(getByText('Product Recommendation')).toBeInTheDocument()
        expect(queryByText('Similar Browsed Products')).not.toBeInTheDocument()
    })

    it('should call onClick when clicked', () => {
        const onClick = jest.fn()
        const {getByText} = render(
            <ProductAutomations
                productAutomationClicked={jest.fn()}
                onClick={onClick}
                onBackClicked={jest.fn()}
            />
        )

        const productRecommendation = getByText('Product Recommendation')
        fireEvent.click(productRecommendation)
        expect(onClick).toHaveBeenCalled()

        expect(getByText('Similar Browsed Products')).toBeInTheDocument()
    })

    it('should call onBackClicked when back button is clicked', () => {
        const onBackClicked = jest.fn()
        const {getByText} = render(
            <ProductAutomations
                productAutomationClicked={jest.fn()}
                onClick={jest.fn()}
                onBackClicked={onBackClicked}
            />
        )

        const productRecommendation = getByText('Product Recommendation')
        fireEvent.click(productRecommendation)

        const backButton = getByText('Back')
        fireEvent.click(backButton)

        expect(onBackClicked).toHaveBeenCalled()
    })
})
