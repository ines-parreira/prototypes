import React, {useCallback, useState} from 'react'
import classnames from 'classnames'
import {ListGroup, ListGroupItem} from 'reactstrap'
import {EditorState} from 'draft-js'
import {fromJS, Map} from 'immutable'

import {IntegrationType} from 'models/integration/constants'
import ShopifyProductLine from 'pages/common/components/ShopifyProductLine/ShopifyProductLine'
import {ProductCardDetails} from 'models/integration/types'
import {insertLink, insertText} from 'utils'
import {getIconFromType} from 'state/integrations/helpers'

import {ActionInjectedProps} from '../types'
import {useToolbarContext} from '../ToolbarContext'
import Popover from './ButtonPopover'

import css from './AddProductLink.less'

type Props = ActionInjectedProps

export type ProductCardAttachment = {
    content_type: 'application/productCard'
    name?: string
    size: number
    url: string
    extra: {
        product_id: number
        variant_id: number
        price?: string
        variant_name?: string
        product_link: string
        currency?: string
        featured_image: string
    }
}

const mapIntegrationToPickedShopifyIntegration = (
    integration: Map<any, any>
) => {
    return fromJS({
        id: integration.get('id'),
        name: integration.get('name'),
        shop_domain: integration.getIn(['meta', 'shop_domain']),
        currency: integration.getIn(['meta', 'currency']),
    }) as Map<any, any>
}

const AddProductLink = ({getEditorState, setEditorState}: Props) => {
    const {
        canAddProductCard,
        canAddProductLink,
        disableVariantSelection,
        onAddProductCardAttachment,
        onInsertProductLinkOpen,
        onInsertProductLinkAdded,
        shopifyIntegrations,
    } = useToolbarContext()
    const [isOpen, setOpen] = useState(false)
    const [pickedShopifyIntegration, setPickedShopifyIntegration] = useState(
        () => {
            if (shopifyIntegrations.size === 1) {
                return mapIntegrationToPickedShopifyIntegration(
                    shopifyIntegrations.get(0) as Map<any, any>
                )
            }

            return null
        }
    )

    const handleResetStoreChoice = () => {
        setPickedShopifyIntegration(null)
    }
    const handlePopoverOpen = () => {
        setOpen(true)

        onInsertProductLinkOpen()
    }
    const handlePopoverClose = useCallback(() => {
        setOpen(false)
    }, [])
    const handlePickIntegration = (integration: Map<any, any>) => {
        setPickedShopifyIntegration(
            mapIntegrationToPickedShopifyIntegration(integration)
        )
    }

    const handleAddProductLink = useCallback(
        (productCardDetails: ProductCardDetails) => {
            const editorState = getEditorState()

            if (canAddProductCard) {
                onAddProductCardAttachment({
                    content_type: 'application/productCard',
                    name: productCardDetails.productTitle,
                    size: 0,
                    url: productCardDetails.imageUrl,
                    extra: {
                        product_id: productCardDetails.productId,
                        variant_id: productCardDetails.variantId,
                        price: productCardDetails.price,
                        variant_name: productCardDetails.variantTitle,
                        product_link: productCardDetails.link,
                        currency: productCardDetails.currency,
                        featured_image: productCardDetails.imageUrl,
                    },
                })
            } else {
                let newEditorState

                if (!canAddProductLink) {
                    newEditorState = insertText(
                        editorState,
                        productCardDetails.link.concat(' ')
                    )
                } else {
                    newEditorState = insertLink(
                        editorState,
                        productCardDetails.link,
                        (productCardDetails.fullProductTitle ||
                            productCardDetails.productTitle)!.concat(' ')
                    )
                }
                newEditorState = EditorState.forceSelection(
                    newEditorState,
                    newEditorState.getSelection()
                )
                setEditorState(newEditorState)
            }

            onInsertProductLinkAdded(productCardDetails)
            setOpen(false)
        },
        [
            getEditorState,
            setEditorState,
            canAddProductCard,
            canAddProductLink,
            onInsertProductLinkAdded,
            onAddProductCardAttachment,
        ]
    )

    return (
        <Popover
            icon="shopify"
            name="Insert Shopify Product"
            isOpen={isOpen}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
        >
            {!pickedShopifyIntegration ? (
                <div className={css.productLineContainer}>
                    <ListGroup flush>
                        {shopifyIntegrations.map(
                            (integration: Map<any, any>, index) => (
                                <ListGroupItem
                                    key={index}
                                    tag="button"
                                    className={css.customListGroup}
                                    action
                                    onClick={(event) => {
                                        event.preventDefault()
                                        handlePickIntegration(integration)
                                    }}
                                >
                                    <div
                                        className={css.integrationRowContainer}
                                    >
                                        <div className={css.integrationRow}>
                                            <img
                                                className={css.shopifyLogo}
                                                alt="Shopify logo"
                                                src={getIconFromType(
                                                    IntegrationType.Shopify
                                                )}
                                            />
                                            <span>
                                                {integration.get('name')}
                                            </span>
                                        </div>
                                        <i
                                            className={classnames(
                                                'material-icons',
                                                css.arrowIcon
                                            )}
                                        >
                                            keyboard_arrow_right
                                        </i>
                                    </div>
                                </ListGroupItem>
                            )
                        )}
                    </ListGroup>
                </div>
            ) : (
                <ShopifyProductLine
                    disableVariantStep={disableVariantSelection}
                    productClicked={handleAddProductLink}
                    onResetStoreChoice={
                        shopifyIntegrations.size > 1
                            ? handleResetStoreChoice
                            : undefined
                    }
                    shopifyIntegration={pickedShopifyIntegration}
                />
            )}
        </Popover>
    )
}

export default AddProductLink
