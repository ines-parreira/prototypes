import { Card, CardHeader } from '@gorgias/axiom'

type ShopifyConnectionBannerProps = {
    shopError: string | null
    selectedShop: string | undefined
    storeCount: number
}

export const ShopifyConnectionBanner = ({
    shopError,
    selectedShop,
    storeCount,
}: ShopifyConnectionBannerProps) => {
    return (
        <>
            {shopError && (
                <Card>
                    <CardHeader description={shopError} />
                </Card>
            )}
            {selectedShop && (
                <>
                    <Card>
                        <CardHeader
                            description={
                                storeCount > 1
                                    ? "You're already connected to Shopify. Select your store to proceed."
                                    : "You're already connected to Shopify. Click next to proceed."
                            }
                        />
                    </Card>
                </>
            )}
        </>
    )
}
