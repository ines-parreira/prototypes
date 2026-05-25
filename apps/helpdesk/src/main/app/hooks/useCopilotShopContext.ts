import { useCopilotContext } from '@gorgias/copilot'

export function useCopilotShopContext(shopName: string | undefined) {
    useCopilotContext({
        description: 'shop_name',
        value: shopName ?? '',
    })
}
