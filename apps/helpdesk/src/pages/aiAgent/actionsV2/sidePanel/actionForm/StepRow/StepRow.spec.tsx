import { render } from '@repo/testing'

import { StepRow } from './StepRow'

describe('StepRow', () => {
    it('renders the action and provider name', () => {
        const { getByText } = render(
            <StepRow
                index={0}
                providerName="Shopify"
                actionName="Cancel order"
                onDelete={() => {}}
            />,
        )
        expect(getByText('Cancel order')).toBeInTheDocument()
        expect(getByText('Shopify')).toBeInTheDocument()
    })

    it('renders the validation error message', () => {
        const { getByText } = render(
            <StepRow
                index={0}
                providerName="Shopify"
                actionName="Cancel order"
                onDelete={() => {}}
                validationError="Order ID is required"
            />,
        )
        expect(getByText('Order ID is required')).toBeInTheDocument()
    })
})
