import { render, screen } from '@testing-library/react'

import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'

import type { MetafieldValueLabelProps } from '../types'
import { MetafieldValueLabel } from './MetafieldValueLabel'

jest.mock('utils', () => ({
    getIconFromUrl: jest.fn(
        (url: string) => `https://mocked-assets.com/${url}`,
    ),
}))

function createMockField(overrides?: Partial<Field>): Field {
    return {
        id: '1',
        key: 'test_key',
        name: 'Test Field',
        type: 'single_line_text_field',
        category: 'Customer',
        isVisible: true,
        ...overrides,
    }
}

const defaultProps: MetafieldValueLabelProps = {
    selectedMetafield: createMockField(),
    displayStoreName: null,
}

function renderComponent(props: Partial<MetafieldValueLabelProps> = {}) {
    const mergedProps = { ...defaultProps, ...props }
    return render(<MetafieldValueLabel {...mergedProps} />)
}

describe('MetafieldValueLabel', () => {
    it('renders metafield name without store name when displayStoreName is null', () => {
        renderComponent({
            selectedMetafield: createMockField({ name: 'Customer VIP Status' }),
            displayStoreName: null,
        })

        expect(screen.getByText('Customer VIP Status')).toBeVisible()
    })

    it('renders metafield name with store name prefix when displayStoreName is provided', () => {
        renderComponent({
            selectedMetafield: createMockField({ name: 'Order Total' }),
            displayStoreName: 'My Store',
        })

        expect(screen.getByText('My Store:Order Total')).toBeVisible()
    })

    it('renders the Shopify integration logo', () => {
        const { container } = renderComponent()

        const logoElement = container.querySelector('[class*="logo"]')
        expect(logoElement).toBeInTheDocument()
        expect(logoElement).toHaveStyle({
            mask: 'url(https://mocked-assets.com/integrations/shopify-mono.svg)',
        })
    })
})
