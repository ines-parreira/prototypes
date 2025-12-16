import { fireEvent, render } from '@testing-library/react'

import ProductFeaturesFOMOFooter from '../ProductFeaturesFOMOFooter'

describe('ProductFeaturesFOMOFooter', () => {
    const onCloseMock = jest.fn()
    const onContinueMock = jest.fn()
    const productDisplayName = 'Helpdesk'

    afterEach(() => {
        onCloseMock.mockClear()
        onContinueMock.mockClear()
    })

    it('renders correctly', () => {
        const { getByText } = render(
            <ProductFeaturesFOMOFooter
                onClose={onCloseMock}
                onContinue={onContinueMock}
                productDisplayName={productDisplayName}
            />,
        )

        expect(
            getByText(`Keep My ${productDisplayName} Plan`),
        ).toBeInTheDocument()
        expect(getByText('Continue To Cancel')).toBeInTheDocument()
    })

    it('calls onClose when "Keep using" button is clicked', () => {
        const { getByText } = render(
            <ProductFeaturesFOMOFooter
                onClose={onCloseMock}
                onContinue={onContinueMock}
                productDisplayName={productDisplayName}
            />,
        )

        fireEvent.click(getByText(`Keep My ${productDisplayName} Plan`))
        expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('calls onContinue when "Continue cancelling" button is clicked', () => {
        const { getByText } = render(
            <ProductFeaturesFOMOFooter
                onClose={onCloseMock}
                onContinue={onContinueMock}
                productDisplayName={productDisplayName}
            />,
        )

        fireEvent.click(getByText('Continue To Cancel'))
        expect(onContinueMock).toHaveBeenCalledTimes(1)
    })
})
