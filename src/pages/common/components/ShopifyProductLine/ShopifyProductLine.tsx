import React, {ChangeEvent, useState, useEffect, useCallback} from 'react'
import {useDebounce} from 'react-use'

import {Input, ListGroup, ListGroupItem, Button} from 'reactstrap'
import {Map} from 'immutable'

import classnames from 'classnames'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import GorgiasApi from '../../../../services/gorgiasApi'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT} from '../../../../constants/integration'

import ProductResult from '../../forms/ProductSearchInput/ProductResult'
import VariantResult from '../../forms/ProductSearchInput/VariantResult'

import {
    Product,
    Variant,
} from '../../../../constants/integrations/types/shopify'

import {IntegrationDataItem} from '../../../../models/integration/types'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import {getIconFromType} from '../../../../state/integrations/helpers'

import css from './ShopifyProductLine.less'

type OwnProps = {
    shopifyIntegration: Map<string, string>
    productClicked: (productLink: string, productTitle?: string) => void
    onResetStoreChoice?: () => void
}
export default function ShopifyProductLine({
    shopifyIntegration,
    onResetStoreChoice,
    productClicked,
}: OwnProps) {
    const gorgiasApi = new GorgiasApi()
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

    const [
        clickedResult,
        setClickedResult,
    ] = useState<null | IntegrationDataItem<Product>>(null)

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

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setFilter(event.target.value)
    }

    const handleProductClick = (index: number) => {
        const result = shopifyProducts[index]

        const variants = result?.data?.variants || []
        if (variants.length === 1 && result) {
            productClicked(
                `https://${shopifyIntegration.get('shop_domain')}/products/${
                    result?.data?.handle || ''
                }`,
                result?.data?.title
            )
        } else {
            setClickedResult(result)
            setSubResults(variants)
        }
    }

    const handleSubResultClicked = (index: number) => {
        const result = subResults[index] as Variant
        let variantTitle = clickedResult?.data.title
        if (result.title && variantTitle)
            variantTitle = variantTitle.concat('-', result.title)
        else variantTitle = result.title
        productClicked(
            `https://${shopifyIntegration.get('shop_domain')}/products/${
                clickedResult?.data.handle || ''
            }?variant=${result?.id || ''}`,
            variantTitle
        )
    }

    const handleBackClicked = () => {
        setSubResults([])
        setClickedResult(null)
    }

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
                            type="button"
                            color="light"
                            size="sm"
                            onClick={
                                subResults.length
                                    ? handleBackClicked
                                    : onResetStoreChoice
                            }
                            tabIndex={-1}
                        >
                            <i className="icon material-icons mr-2">
                                arrow_back
                            </i>
                            Back
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
                            {shopifyProducts.length} PRODUCTS
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
