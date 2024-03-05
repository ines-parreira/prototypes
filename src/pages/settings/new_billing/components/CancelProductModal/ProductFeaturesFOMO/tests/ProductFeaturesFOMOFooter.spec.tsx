import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import ProductFeaturesFOMOFooter from '../ProductFeaturesFOMOFooter'

describe('ProductFeaturesFOMOFooter', () => {
    const onCloseMock = jest.fn()
    const onContinueMock = jest.fn()
    const productType = 'Helpdesk'

    afterEach(() => {
        onCloseMock.mockClear()
        onContinueMock.mockClear()
    })

    it('renders correctly', () => {
        const {getByText} = render(
            <ProductFeaturesFOMOFooter
                onClose={onCloseMock}
                onContinue={onContinueMock}
                productType={productType}
            />
        )

        expect(getByText(`Keep using ${productType}`)).toBeInTheDocument()
        expect(getByText('Continue cancelling')).toBeInTheDocument()
    })

    it('calls onClose when "Keep using" button is clicked', () => {
        const {getByText} = render(
            <ProductFeaturesFOMOFooter
                onClose={onCloseMock}
                onContinue={onContinueMock}
                productType={productType}
            />
        )

        fireEvent.click(getByText(`Keep using ${productType}`))
        expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('calls onContinue when "Continue cancelling" button is clicked', () => {
        const {getByText} = render(
            <ProductFeaturesFOMOFooter
                onClose={onCloseMock}
                onContinue={onContinueMock}
                productType={productType}
            />
        )

        fireEvent.click(getByText('Continue cancelling'))
        expect(onContinueMock).toHaveBeenCalledTimes(1)
    })
})
