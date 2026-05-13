import { render } from '@repo/testing'

import { StoreReadonly } from './StoreReadonly'

describe('StoreReadonly', () => {
    it('renders the store name in a disabled field', () => {
        const { getByDisplayValue } = render(
            <StoreReadonly store={{ id: 'store-1', name: 'Acme US' }} />,
        )
        const input = getByDisplayValue('Acme US')
        expect(input).toBeDisabled()
    })

    it('renders the provider icon when iconUrl is provided', () => {
        const { getByAltText } = render(
            <StoreReadonly
                store={{
                    id: 'store-1',
                    name: 'Acme US',
                    iconUrl: 'https://example.com/shopify.svg',
                }}
            />,
        )
        expect(getByAltText('Acme US')).toBeInTheDocument()
    })

    it('uses a custom label when supplied', () => {
        const { getByText } = render(
            <StoreReadonly
                store={{ id: 'store-1', name: 'Acme US' }}
                label="Connected store"
            />,
        )
        expect(getByText('Connected store')).toBeInTheDocument()
    })
})
