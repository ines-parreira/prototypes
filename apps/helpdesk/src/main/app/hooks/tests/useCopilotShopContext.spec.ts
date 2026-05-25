import { assumeMock, renderHook } from '@repo/testing'

import { useCopilotContext } from '@gorgias/copilot'

import { useCopilotShopContext } from '../useCopilotShopContext'

const useCopilotContextMock = assumeMock(useCopilotContext)

describe('useCopilotShopContext', () => {
    beforeEach(() => {
        useCopilotContextMock.mockClear()
    })

    it('registers shop_name when a shop is provided', () => {
        renderHook(() => useCopilotShopContext('acme-store'))

        expect(useCopilotContextMock).toHaveBeenCalledTimes(1)
        expect(useCopilotContextMock).toHaveBeenCalledWith({
            description: 'shop_name',
            value: 'acme-store',
        })
    })

    it('passes an empty value when the shop name is undefined', () => {
        renderHook(() => useCopilotShopContext(undefined))

        expect(useCopilotContextMock).toHaveBeenCalledWith({
            description: 'shop_name',
            value: '',
        })
    })

    it('updates the entry when the shop name changes', () => {
        const { rerender } = renderHook(
            ({ name }: { name: string | undefined }) =>
                useCopilotShopContext(name),
            { initialProps: { name: 'first-shop' } },
        )

        useCopilotContextMock.mockClear()
        rerender({ name: 'second-shop' })

        expect(useCopilotContextMock).toHaveBeenCalledWith({
            description: 'shop_name',
            value: 'second-shop',
        })
    })
})
