import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { CustomerDetailsPanel } from './CustomerDetailsPanel'

vi.mock('./CustomActions', () => ({
    CustomActions: () => null,
}))

vi.mock('./MetafieldsSection', () => ({
    MetafieldsSection: () => null,
}))

vi.mock('./CustomerInfoFieldList', () => ({
    CustomerInfoFieldList: () => null,
}))

const baseProps = {
    filteredIntegrations: [],
    selectedIntegration: undefined,
    isLoadingIntegrations: false,
    onStoreChange: vi.fn(),
    hasData: false,
    isLoadingShopper: false,
    isLoadingPurchaseSummary: false,
    customerFields: [],
    context: {} as never,
    sections: [],
    shopper: undefined,
}

describe('CustomerDetailsPanel', () => {
    it('renders the Shopify header without the NewOrdersSidebar flag', () => {
        render(<CustomerDetailsPanel {...baseProps} />)

        expect(screen.getByText('Shopify')).toBeInTheDocument()
        expect(
            screen.getByText('Shopify').closest('[data-sticky-state]'),
        ).toBeNull()
    })

    it('renders the Shopify header with the NewOrdersSidebar flag and applies sticky state', () => {
        render(<CustomerDetailsPanel {...baseProps} hasNewOrdersSidebar />)

        expect(screen.getByText('Shopify')).toBeInTheDocument()
        expect(
            screen.getByText('Shopify').closest('[data-sticky-state]'),
        ).toBeInTheDocument()
    })
})
