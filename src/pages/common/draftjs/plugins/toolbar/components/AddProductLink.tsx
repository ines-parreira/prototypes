import React, {useCallback, useState, useMemo} from 'react'
import classnames from 'classnames'
import {ListGroup, ListGroupItem} from 'reactstrap'
import {EditorState} from 'draft-js'
import {Map} from 'immutable'

import {IntegrationType} from 'models/integration/constants'
import ShopifyProductLine from 'pages/common/components/ShopifyProductLine/ShopifyProductLine'
import {ProductCardDetails} from 'models/integration/types'
import {insertLink, insertText} from 'utils'
import {getIconFromType} from 'state/integrations/helpers'

import {AttachmentEnum} from 'common/types'
import {ActionInjectedProps, ActionName} from '../types'
import {
    getTooltipTourConfiguration,
    mapIntegrationToPickedShopifyIntegration,
    transformProductCardDetailsToProductCardAttachment,
} from '../utils'
import {useToolbarContext} from '../ToolbarContext'
import Popover from './ButtonPopover'

import css from './AddProductLink.less'

type Props = ActionInjectedProps

export type ProductCardAttachment = {
    content_type: AttachmentEnum.Product
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

const AddProductLink = ({getEditorState, setEditorState}: Props) => {
    const {
        canAddProductCard,
        canAddProductLink,
        canAddProductAutomations,
        disableOutOfStockProducts,
        disableVariantSelection,
        onAddProductCardAttachment,
        onAddProductAutomationAttachment,
        onInsertProductLinkOpen,
        onInsertProductLinkAdded,
        shopifyIntegrations,
        toolbarTour,
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

    const tour = useMemo(() => {
        return getTooltipTourConfiguration(
            ActionName.ProductPicker,
            toolbarTour
        )
    }, [toolbarTour])

    const handleAddProductLink = useCallback(
        (productCardDetails: ProductCardDetails) => {
            const editorState = getEditorState()

            if (canAddProductCard) {
                onAddProductCardAttachment(
                    transformProductCardDetailsToProductCardAttachment(
                        productCardDetails
                    )
                )
            } else {
                let newEditorState
                const productTitle =
                    productCardDetails.fullProductTitle ??
                    productCardDetails.productTitle ??
                    ''

                if (!canAddProductLink) {
                    newEditorState = insertText(
                        editorState,
                        [productTitle, productCardDetails.link]
                            .join(': ')
                            .concat(' ')
                    )
                } else {
                    newEditorState = insertLink(
                        editorState,
                        productCardDetails.link,
                        productTitle.concat(' ')
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

    const handleProductAutomationClicked = useCallback(
        (attachment) => {
            onAddProductAutomationAttachment(attachment)
            setOpen(false)
        },
        [onAddProductAutomationAttachment]
    )

    return (
        <Popover
            icon="shopify"
            name="Insert Shopify Product"
            tour={tour}
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
                    disableOutOfStockProducts={disableOutOfStockProducts}
                    disableVariantStep={disableVariantSelection}
                    productClicked={handleAddProductLink}
                    canAddProductAutomations={canAddProductAutomations}
                    productAutomationClicked={handleProductAutomationClicked}
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
