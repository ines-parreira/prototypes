import { render } from '@repo/testing'

import { StoreSelector } from './StoreSelector'

describe('StoreSelector', () => {
    it('auto-selects when there is exactly one store', () => {
        const onSelect = jest.fn()
        render(
            <StoreSelector
                stores={[{ id: 'store-1', name: 'Acme US' }]}
                selectedStoreId={null}
                onSelect={onSelect}
            />,
        )
        expect(onSelect).toHaveBeenCalledWith('store-1')
    })

    it('does not auto-select when multiple stores are available', () => {
        const onSelect = jest.fn()
        render(
            <StoreSelector
                stores={[
                    { id: 'store-1', name: 'Acme US' },
                    { id: 'store-2', name: 'Acme EU' },
                ]}
                selectedStoreId={null}
                onSelect={onSelect}
            />,
        )
        expect(onSelect).not.toHaveBeenCalled()
    })

    it('does not re-select when the user already chose a store', () => {
        const onSelect = jest.fn()
        render(
            <StoreSelector
                stores={[{ id: 'store-1', name: 'Acme US' }]}
                selectedStoreId="store-1"
                onSelect={onSelect}
            />,
        )
        expect(onSelect).not.toHaveBeenCalled()
    })
})
