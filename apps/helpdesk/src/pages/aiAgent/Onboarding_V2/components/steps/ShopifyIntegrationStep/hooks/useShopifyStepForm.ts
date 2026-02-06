import { useMemo } from 'react'

import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { StoreIntegration } from 'models/integration/types'

const ShopifyFormSchema = z.object({
    shopName: z.string().min(1, 'Please select a Shopify store'),
    shopType: z.string().optional(),
})

export type ShopifyFormValues = z.infer<typeof ShopifyFormSchema>

interface UseShopifyStepFormParams {
    shopName: string | undefined
    shopType: string | undefined
    availableStores: StoreIntegration[]
    setShopError: (error: string | null) => void
}

interface UseShopifyStepFormReturn {
    methods: UseFormReturn<ShopifyFormValues>
    selectedShop: string | undefined
    selectedShopType: string | undefined
    selectedIntegration: StoreIntegration | undefined
    onSelectShop: (shopId: number | null) => void
    isDirty: boolean
}

export function useShopifyStepForm({
    shopName,
    shopType,
    availableStores,
    setShopError,
}: UseShopifyStepFormParams): UseShopifyStepFormReturn {
    const methods = useForm<ShopifyFormValues>({
        values: {
            shopName: shopName ?? '',
            shopType: shopType ?? '',
        },
    })

    const { watch, setValue, formState } = methods

    const selectedShop = watch('shopName') || availableStores[0]?.name
    const selectedShopType = watch('shopType') || availableStores[0]?.type

    const selectedIntegration = useMemo(
        () =>
            availableStores.find((store) => store.name === selectedShop) ||
            availableStores[0],
        [availableStores, selectedShop],
    )

    const onSelectShop = (shopId: number | null) => {
        const foundShop = availableStores.find((shop) => shop.id === shopId)
        if (foundShop) {
            setValue('shopName', foundShop.name, {
                shouldDirty: true,
            })
            setValue('shopType', foundShop.type, {
                shouldDirty: true,
            })
            setShopError(null)
        }
    }

    return {
        methods,
        selectedShop,
        selectedShopType,
        selectedIntegration,
        onSelectShop,
        isDirty: formState.isDirty,
    }
}
