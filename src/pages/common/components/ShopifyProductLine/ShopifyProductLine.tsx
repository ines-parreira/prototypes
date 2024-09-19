import React, {ChangeEvent, useCallback, useEffect, useState} from 'react'
import {Input, ListGroup, ListGroupItem} from 'reactstrap'
import {Map} from 'immutable'
import classnames from 'classnames'

import {getIconFromUrl} from 'utils'
import {
    INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
    PRODUCTS_PER_PAGE,
} from 'constants/integration'
import {IntegrationDataItem, ProductCardDetails} from 'models/integration/types'
import GorgiasApi from 'services/gorgiasApi'
import {notify} from 'state/notifications/actions'
import {getIconFromType} from 'state/integrations/helpers'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import {IntegrationType} from 'models/integration/constants'
import {Product, Variant} from 'constants/integrations/types/shopify'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Result, {
    Props as ResultProps,
} from 'pages/common/forms/ProductSearchInput/Result'

import {shopifyDataMappers} from 'pages/common/forms/ProductSearchInput/Mappings'
import ProductAutomations from 'pages/common/components/ProductAutomations/ProductAutomations'
import {ProductRecommendationAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'
import {transformShopifyProductToProductCardDetails} from 'pages/common/draftjs/plugins/toolbar/utils'
import {RichFieldEditorPlacement} from 'pages/common/forms/RichField/enums'
import {ConvertShopifyProductLineHeader} from 'pages/convert/common/components/ConvertShopifyProductLineHeader/ConvertShopifyProductLineHeader'
import css from './ShopifyProductLine.less'

type OwnProps = {
    disableOutOfStockProducts?: boolean
    disableVariantStep?: boolean
    shopifyIntegration: Map<string, string>
    productClicked: (productCardDetails: ProductCardDetails) => void
    canAddProductAutomations: boolean
    productAutomationClicked: (
        attachment: ProductRecommendationAttachment
    ) => void
    onResetStoreChoice?: () => void
    placementType?: RichFieldEditorPlacement
}

const generateResultProps = (
    disableOutOfStockProducts: boolean,
    props: ResultProps
): ResultProps => {
    if (disableOutOfStockProducts) {
        return props
    }

    // Force to be always available
    props.stock.isAvailable = true
    return props
}

const generateVariantName = (
    productOptions?: Array<Record<string, any>>,
    variantOptions?: Record<string, any>
) => {
    if (!productOptions?.length || !variantOptions) return undefined
    let variantName = ''

    productOptions.forEach(function (productOption, index) {
        variantName = variantName.concat(
            ' ',
            productOption.name,
            ': ',
            variantOptions[index]
        )
        if (index < productOptions.length - 1)
            variantName = variantName.concat(' | ')
    })
    return variantName
}

export default function ShopifyProductLine({
    disableOutOfStockProducts = false,
    disableVariantStep = false,
    shopifyIntegration,
    onResetStoreChoice,
    productClicked,
    canAddProductAutomations,
    productAutomationClicked,
    placementType,
}: OwnProps) {
    const gorgiasApi = new GorgiasApi()
    const shopifyPlaceholderImage = 'integrations/shopify-placeholder.png'
    const dispatch = useAppDispatch()
    const [filter, setFilter] = useState('')
    const [onOpen, setOnOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isProductAutomationPicked, setIsProductAutomationPicked] =
        useState(false)
    const [shopifyProducts, setShopifyProducts] = useState<
        IntegrationDataItem<Product>[]
    >([])
    const [subResults, setSubResults] = useState<
        Array<IntegrationDataItem<Product>> | Array<Variant>
    >([])

    const [clickedResult, setClickedResult] =
        useState<null | IntegrationDataItem<Product>>(null)

    const fetchResults = useCallback(async () => {
        try {
            const results = await gorgiasApi.search(
                `/api/integrations/${shopifyIntegration.get(
                    'id'
                )}/${INTEGRATION_DATA_ITEM_TYPE_PRODUCT}/`,
                filter
            )
            setShopifyProducts(results as Array<IntegrationDataItem<Product>>)
            setSubResults([])
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: "Couldn't fetch Shopify products",
                })
            )
        } finally {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            event.preventDefault()
            setIsLoading(true)
            setFilter(event.target.value)
        },
        [setFilter, setIsLoading]
    )

    const handleProductClick = useCallback(
        (index: number) => {
            const result = shopifyProducts[index]
            const variants = result?.data?.variants || []

            if (disableVariantStep || (variants.length === 1 && result)) {
                const productCardDetails =
                    transformShopifyProductToProductCardDetails(
                        result,
                        shopifyIntegration,
                        disableVariantStep && variants.length > 1
                    )
                productClicked(productCardDetails)
            } else {
                setClickedResult(result)
                setSubResults(variants)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [productClicked, shopifyProducts, disableVariantStep]
    )

    const handleSubResultClicked = useCallback(
        (index: number) => {
            const result = subResults[index] as Variant

            let fullProductTitle = clickedResult?.data.title
            if (result.title && fullProductTitle)
                fullProductTitle = fullProductTitle.concat('-', result.title)
            else fullProductTitle = result.title
            const pickedOptions = (
                ['option1', 'option2', 'option3'] as Array<keyof Variant>
            ).map((key) => {
                if (result[key]) return result[key]
            })

            const variantTitle = generateVariantName(
                clickedResult?.data?.options,
                pickedOptions
            )

            const variantImage = clickedResult?.data?.images?.find(
                (image) => image.id === result.image_id
            )

            const variantCardDetails = {
                imageUrl:
                    variantImage?.src ||
                    clickedResult?.data?.image?.src ||
                    getIconFromUrl(shopifyPlaceholderImage),
                price: result?.price,
                currency: shopifyIntegration.get('currency'),
                link: `https://${shopifyIntegration.get(
                    'shop_domain'
                )}/products/${clickedResult?.data.handle || ''}?variant=${
                    result?.id || ''
                }`,
                productTitle: clickedResult?.data?.title,
                variantTitle: variantTitle,
                fullProductTitle: fullProductTitle,
                productId: clickedResult?.data?.id,
                variantId: result?.id,
            } as ProductCardDetails

            productClicked(variantCardDetails)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [productClicked, subResults, generateVariantName]
    )

    const handleBackClicked = useCallback(() => {
        setSubResults([])
        setClickedResult(null)
    }, [setSubResults, setClickedResult])

    useDebouncedEffect(fetchResults, [filter], 300)
    useEffect(() => {
        if (onOpen) {
            setIsLoading(true)
            void fetchResults
            setOnOpen(!onOpen)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    return (
        <div className={css.productLineContainer}>
            {!isProductAutomationPicked && (
                <div
                    className={classnames(
                        'input-icon input-icon-left',
                        css.searchInput
                    )}
                >
                    <i className="icon material-icons md-2">
                        {isLoading ? 'more_horiz' : 'search'}
                    </i>
                    <Input
                        type="text"
                        value={filter}
                        onChange={handleChange}
                        placeholder={'Search products'}
                        autoFocus
                    />
                </div>
            )}
            {!filter && canAddProductAutomations && (
                <ProductAutomations
                    productAutomationClicked={productAutomationClicked}
                    onClick={() => setIsProductAutomationPicked(true)}
                    onBackClicked={() => setIsProductAutomationPicked(false)}
                />
            )}
            {!isProductAutomationPicked && (
                <>
                    {placementType ===
                    RichFieldEditorPlacement.ConvertDetail ? (
                        <ConvertShopifyProductLineHeader
                            productsLength={shopifyProducts.length}
                            productsPerPage={PRODUCTS_PER_PAGE}
                        />
                    ) : (
                        <div className={css.headerResult}>
                            {(onResetStoreChoice || subResults.length > 0) && (
                                <div className={css.backContainer}>
                                    <Button
                                        className="mr-2"
                                        onClick={
                                            subResults.length
                                                ? handleBackClicked
                                                : onResetStoreChoice
                                        }
                                        size="small"
                                        tabIndex={-1}
                                    >
                                        <ButtonIconLabel icon="arrow_back">
                                            Back
                                        </ButtonIconLabel>
                                    </Button>
                                </div>
                            )}
                            <div>
                                <img
                                    src={getIconFromType(
                                        IntegrationType.Shopify
                                    )}
                                    alt="Shopify logo"
                                    className={css.shopifyLogo}
                                />
                                <span className={css.headerText}>
                                    {shopifyIntegration.get('name')}
                                </span>
                            </div>
                            <div className={css.itemCount}>
                                {subResults.length ? (
                                    <span className={css.resultTotal}>
                                        {subResults.length} VARIANTS
                                    </span>
                                ) : (
                                    <span className={css.resultTotal}>
                                        {shopifyProducts.length}
                                        {shopifyProducts.length >=
                                        PRODUCTS_PER_PAGE
                                            ? '+'
                                            : ''}
                                        {' PRODUCTS'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={css.listGroupContainer}>
                        {shopifyProducts.length > 0 && !subResults.length && (
                            <ListGroup flush>
                                {shopifyProducts.map((result, index) => {
                                    const productDetails =
                                        shopifyDataMappers.product(result)

                                    return (
                                        <ListGroupItem
                                            key={result.id}
                                            tag="button"
                                            id={'resultRow'.concat(
                                                index.toString()
                                            )}
                                            action
                                            className={classnames({
                                                [css.outOfStock]:
                                                    disableOutOfStockProducts
                                                        ? productDetails.stock
                                                              .isAvailable ===
                                                          false
                                                        : false,
                                            })}
                                            onClick={(event) => {
                                                event.preventDefault()
                                                handleProductClick(index)
                                            }}
                                        >
                                            <Result
                                                {...generateResultProps(
                                                    disableOutOfStockProducts,
                                                    productDetails
                                                )}
                                            />
                                        </ListGroupItem>
                                    )
                                })}
                            </ListGroup>
                        )}
                        {shopifyProducts.length > 0 && subResults.length > 0 && (
                            <ListGroup flush>
                                {(subResults as Array<Variant>).map(
                                    (subResult: Variant, index: number) => {
                                        if (clickedResult === null) {
                                            return
                                        }

                                        const productDetails =
                                            shopifyDataMappers.variants(
                                                clickedResult,
                                                subResult
                                            )
                                        return (
                                            <ListGroupItem
                                                key={index}
                                                tag="button"
                                                action
                                                className={classnames({
                                                    [css.outOfStock]:
                                                        disableOutOfStockProducts
                                                            ? !productDetails
                                                                  .stock
                                                                  .isAvailable
                                                            : false,
                                                })}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    handleSubResultClicked(
                                                        index
                                                    )
                                                }}
                                            >
                                                {clickedResult && (
                                                    <Result
                                                        {...generateResultProps(
                                                            disableOutOfStockProducts,
                                                            productDetails
                                                        )}
                                                    />
                                                )}
                                            </ListGroupItem>
                                        )
                                    }
                                )}
                            </ListGroup>
                        )}
                        {!shopifyProducts.length && !subResults.length && (
                            <div className={css.noResultContainer}>
                                <p className={css.noResultText}>
                                    No results found
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
