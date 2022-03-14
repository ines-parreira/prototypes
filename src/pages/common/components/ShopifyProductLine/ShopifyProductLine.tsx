import React, {ChangeEvent, useState, useEffect, useCallback} from 'react'
import {useDebounce} from 'react-use'

import {Input, ListGroup, ListGroupItem} from 'reactstrap'
import {Map} from 'immutable'

import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import GorgiasApi from '../../../../services/gorgiasApi'
import {
    INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
    PRODUCTS_PER_PAGE,
} from '../../../../constants/integration'

import ProductResult from '../../forms/ProductSearchInput/ProductResult'
import VariantResult from '../../forms/ProductSearchInput/VariantResult'

import {
    IntegrationDataItem,
    Product,
    Variant,
    ProductCardDetails,
} from '../../../../models/integration/types'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import {getIconFromType} from '../../../../state/integrations/helpers'
import {getIconFromUrl} from '../../../../utils'

import css from './ShopifyProductLine.less'

type OwnProps = {
    shopifyIntegration: Map<string, string>
    productClicked: (productCardDetails: ProductCardDetails) => void
    onResetStoreChoice?: () => void
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
    shopifyIntegration,
    onResetStoreChoice,
    productClicked,
}: OwnProps) {
    const gorgiasApi = new GorgiasApi()
    const shopifyPlaceholderImage = 'integrations/shopify-placeholder.png'
    const dispatch = useAppDispatch()
    const [filter, setFilter] = useState('')
    const [onOpen, setOnOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
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

            if (variants.length === 1 && result) {
                const productCardDetails = {
                    imageUrl:
                        result?.data?.image?.src ||
                        getIconFromUrl(shopifyPlaceholderImage),
                    price: result?.data?.variants[0].price,
                    currency: shopifyIntegration.get('currency'),
                    link: `https://${shopifyIntegration.get(
                        'shop_domain'
                    )}/products/${result?.data?.handle || ''}`,
                    productTitle: result?.data?.title,
                    productId: result?.data?.id,
                    variantId: result?.data?.variants?.[0]?.id,
                } as ProductCardDetails

                productClicked(productCardDetails)
            } else {
                setClickedResult(result)
                setSubResults(variants)
            }
        },
        [productClicked, shopifyProducts]
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

            const variantCardDetails = {
                imageUrl:
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
        [productClicked, subResults, generateVariantName]
    )

    const handleBackClicked = useCallback(() => {
        setSubResults([])
        setClickedResult(null)
    }, [setSubResults, setClickedResult])

    useDebounce(fetchResults, 300, [filter])
    useEffect(() => {
        if (onOpen) {
            setIsLoading(true)
            void fetchResults
            setOnOpen(!onOpen)
        }
    }, [filter])

    return (
        <div className={css.productLineContainer}>
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
            <div className={css.headerResult}>
                <div className={css.backContainer}>
                    {(onResetStoreChoice || subResults.length > 0) && (
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
                    )}
                </div>
                <div>
                    <img
                        src={getIconFromType('shopify')}
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
                            {shopifyProducts.length >= PRODUCTS_PER_PAGE
                                ? '+'
                                : ''}
                            {' PRODUCTS'}
                        </span>
                    )}
                </div>
            </div>
            <div className={css.listGroupContainer}>
                {shopifyProducts.length > 0 && !subResults.length && (
                    <ListGroup flush>
                        {shopifyProducts.map((result, index) => (
                            <ListGroupItem
                                key={index}
                                tag="button"
                                id={'resultRow'.concat(index.toString())}
                                action
                                onClick={(event) => {
                                    event.preventDefault()
                                    handleProductClick(index)
                                }}
                            >
                                <ProductResult result={result} />
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                )}
                {shopifyProducts.length > 0 && subResults.length > 0 && (
                    <ListGroup flush>
                        {(subResults as Array<Variant>).map(
                            (subResult: Variant, index: number) => (
                                <ListGroupItem
                                    key={index}
                                    tag="button"
                                    action
                                    onClick={(event) => {
                                        event.preventDefault()
                                        handleSubResultClicked(index)
                                    }}
                                >
                                    <VariantResult
                                        result={clickedResult!}
                                        subResult={subResult}
                                    />
                                </ListGroupItem>
                            )
                        )}
                    </ListGroup>
                )}
                {!shopifyProducts.length && !subResults.length && (
                    <div className={css.noResultContainer}>
                        <p className={css.noResultText}>No results found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
