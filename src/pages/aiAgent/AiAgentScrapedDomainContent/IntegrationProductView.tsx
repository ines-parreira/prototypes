import React, { useState } from 'react'

import { Product } from 'constants/integrations/types/shopify'
import ControlledCollapsibleDetails from 'pages/tickets/detail/components/TicketVoiceCall/ControlledCollapsibleDetails'
import { sanitizeHtmlMinimal } from 'utils/html'

import css from './IntegrationProductView.less'

type Props = {
    product: Product
}

const MAX_IMAGES = 5

const IntegrationProductView = ({ product }: Props) => {
    const [isVariantsOpen, setIsVariantsOpen] = useState(false)

    const formatPrice = (price: string | number, currency: string = 'USD') => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol',
            maximumFractionDigits: 2,
        })
        return price && Number(price) > 0 ? formatter.format(Number(price)) : ''
    }

    return (
        <div className={css.productDetails}>
            <div className={css.productField}>
                <span className="body-semibold">Product ID:</span> {product.id}
            </div>
            <div className={css.productField}>
                <span className="body-semibold">Title:</span> {product.title}
            </div>
            <div className={css.productField}>
                <span className="body-semibold">Vendor:</span> {product.vendor}
            </div>
            {product.images?.length > 0 && (
                <div className={css.productField}>
                    <span className="body-semibold">Images</span>
                    {product.images?.length > MAX_IMAGES && (
                        <span className={css.imageCount}>
                            {` (showing ${MAX_IMAGES} of ${product.images?.length}
                             images)`}
                        </span>
                    )}
                    <div className={css.imageGrid}>
                        {product.images
                            ?.slice(0, MAX_IMAGES)
                            ?.map((image: any, index: number) => (
                                <img
                                    key={image.id}
                                    src={image.src}
                                    alt={
                                        image.alt ||
                                        `Product image ${index + 1}`
                                    }
                                    className={css.productImage}
                                />
                            ))}
                    </div>
                </div>
            )}
            {product.body_html && (
                <div className={css.productField}>
                    <span className="body-semibold">Description</span>
                    <div
                        className={css.description}
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlMinimal(product.body_html),
                        }}
                    />
                </div>
            )}
            {product.variants && product.variants.length > 0 && (
                <div className="mt-4">
                    <ControlledCollapsibleDetails
                        isOpen={isVariantsOpen}
                        setIsOpen={setIsVariantsOpen}
                        title={
                            <div className={css.collapsibleVariantsTitle}>
                                Available Variants
                            </div>
                        }
                    >
                        <div className={css.variantsList}>
                            {product.variants.map((variant: any) => (
                                <div
                                    key={variant.id}
                                    className={css.variantItem}
                                >
                                    <div className={css.productField}>
                                        <span className="body-semibold">
                                            Variant ID:
                                        </span>{' '}
                                        {variant.id}
                                    </div>
                                    <div className={css.productField}>
                                        <span className="body-semibold">
                                            Variant Title:
                                        </span>{' '}
                                        {variant.title}
                                    </div>
                                    <div className={css.productField}>
                                        <span className="body-semibold">
                                            Discounted Price:
                                        </span>{' '}
                                        {variant.compare_at_price ? (
                                            <div
                                                className={css.pricesContainer}
                                            >
                                                <span>
                                                    {formatPrice(variant.price)}
                                                </span>
                                                <span
                                                    className={
                                                        css.strikethroughPrice
                                                    }
                                                >
                                                    {formatPrice(
                                                        variant.compare_at_price,
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                className={css.pricesContainer}
                                            >
                                                <span>None</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={css.productField}>
                                        <span className="body-semibold">
                                            Price:
                                        </span>{' '}
                                        {formatPrice(variant.price)}
                                    </div>
                                    <div className={css.productField}>
                                        <span className="body-semibold">
                                            Inventory:
                                        </span>{' '}
                                        {variant.inventory_quantity > 0 ? (
                                            `${variant.inventory_quantity} in stock`
                                        ) : (
                                            <span>Out of stock</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ControlledCollapsibleDetails>
                </div>
            )}
        </div>
    )
}

export default IntegrationProductView
