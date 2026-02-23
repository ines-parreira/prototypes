import React, { useCallback, useMemo, useState } from 'react'

import classnames from 'classnames'
import { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { ListGroup, ListGroupItem } from 'reactstrap'

import type { AttachmentEnum } from 'common/types'
import { IntegrationType } from 'models/integration/constants'
import type { ProductCardDetails } from 'models/integration/types'
import ShopifyProductLine from 'pages/common/components/ShopifyProductLine/ShopifyProductLine'
import type { ProductRecommendationAttachment } from 'pages/convert/campaigns/types/CampaignAttachment'
import { getIconFromType } from 'state/integrations/helpers'
import { insertLink, insertText } from 'utils'

import { useToolbarContext } from '../ToolbarContext'
import type { ActionInjectedProps } from '../types'
import { ActionName } from '../types'
import {
    getTooltipTourConfiguration,
    mapIntegrationToPickedShopifyIntegration,
    transformProductCardDetailsToProductCardAttachment,
} from '../utils'
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
        compare_at_price?: string
        variant_name?: string
        product_link: string
        currency?: string
        featured_image: string
    }
}

const AddProductLink = ({
    getEditorState,
    setEditorState,
    isDisabled,
}: Props) => {
    const {
        canAddProductCard,
        canAddProductLink,
        canAddProductAutomations,
        currentShopifyIntegration,
        disableOutOfStockProducts,
        disableVariantSelection,
        onAddProductCardAttachment,
        onAddProductAutomationAttachment,
        onInsertProductLinkOpen,
        onInsertProductLinkAdded,
        shopifyIntegrations,
        toolbarTour,
        placementType,
    } = useToolbarContext()
    const [isOpen, setOpen] = useState(false)
    const [pickedShopifyIntegration, setPickedShopifyIntegration] = useState(
        () => {
            if (currentShopifyIntegration) {
                return mapIntegrationToPickedShopifyIntegration(
                    fromJS(currentShopifyIntegration),
                )
            }

            if (shopifyIntegrations.size === 1) {
                return mapIntegrationToPickedShopifyIntegration(
                    shopifyIntegrations.get(0) as Map<any, any>,
                )
            }

            return null
        },
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
            mapIntegrationToPickedShopifyIntegration(integration),
        )
    }

    const tour = useMemo(() => {
        return getTooltipTourConfiguration(
            ActionName.ProductPicker,
            toolbarTour,
        )
    }, [toolbarTour])

    const handleAddProductLink = useCallback(
        (productCardDetails: ProductCardDetails) => {
            const editorState = getEditorState()

            if (canAddProductCard) {
                onAddProductCardAttachment(
                    transformProductCardDetailsToProductCardAttachment(
                        productCardDetails,
                    ),
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
                            .concat(' '),
                    )
                } else {
                    newEditorState = insertLink(
                        editorState,
                        productCardDetails.link,
                        productTitle.concat(' '),
                    )
                }
                const selection = newEditorState
                    .getSelection()
                    .merge({ hasFocus: true })
                newEditorState = EditorState.forceSelection(
                    newEditorState,
                    selection,
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
        ],
    )

    const handleProductAutomationClicked = useCallback(
        (attachment: ProductRecommendationAttachment) => {
            onAddProductAutomationAttachment(attachment)
            setOpen(false)
        },
        [onAddProductAutomationAttachment],
    )

    return (
        <Popover
            icon="shopify"
            name="Insert Shopify Product"
            tour={tour}
            isOpen={isOpen}
            isDisabled={isDisabled}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
        >
            {!pickedShopifyIntegration ? (
                <div className={css.productLineContainer}>
                    <ListGroup flush>
                        {shopifyIntegrations
                            .toArray()
                            .map(
                                (integration: Map<any, any>, index: number) => (
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
                                            className={
                                                css.integrationRowContainer
                                            }
                                        >
                                            <div className={css.integrationRow}>
                                                <img
                                                    className={css.shopifyLogo}
                                                    alt="Shopify logo"
                                                    src={getIconFromType(
                                                        IntegrationType.Shopify,
                                                    )}
                                                />
                                                <span>
                                                    {integration.get('name')}
                                                </span>
                                            </div>
                                            <i
                                                className={classnames(
                                                    'material-icons',
                                                    css.arrowIcon,
                                                )}
                                            >
                                                keyboard_arrow_right
                                            </i>
                                        </div>
                                    </ListGroupItem>
                                ),
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
                    placementType={placementType}
                />
            )}
        </Popover>
    )
}

export default AddProductLink
