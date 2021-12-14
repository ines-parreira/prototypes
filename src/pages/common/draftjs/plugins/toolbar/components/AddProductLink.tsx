import React, {useEffect, useState, useCallback} from 'react'

import {connect, ConnectedProps} from 'react-redux'

import classnames from 'classnames'

import {ListGroup, ListGroupItem} from 'reactstrap'
import {EditorState} from 'draft-js'
import {fromJS, Map, List} from 'immutable'

import ShopifyProductLine from '../../../../components/ShopifyProductLine/ShopifyProductLine'

import {RootState} from '../../../../../../state/types'
import {ProductCardDetails} from '../../../../../../models/integration/types'

import shortcutManager from '../../../../../../services/shortcutManager'

import {insertLink, insertText} from '../../../../../../utils'

import {addProductCardAttachments} from '../../../../../../state/newMessage/actions'

import {
    getNewMessageChannel,
    isNewMessagePublic,
} from '../../../../../../state/newMessage/selectors'
import {TicketChannel} from '../../../../../../business/types/ticket'

import {EditorStateGetter, EditorStateSetter} from '../types'

import {getIconFromType} from '../../../../../../state/integrations/helpers'

import {UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS} from '../../../../../../config/integrations/shopify'

import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker.js'
import {SegmentEvent} from '../../../../../../store/middlewares/types/segmentTracker'
import {getCurrentAccountState} from '../../../../../../state/currentAccount/selectors'

import css from './AddProductLink.less'
import Popover from './ButtonPopover'

type OwnProps = {
    getEditorState: EditorStateGetter
    setEditorState: EditorStateSetter
    integrations: List<any>
    productCardsEnabled: boolean
}

export function AddProductLink({
    integrations,
    getEditorState,
    setEditorState,
    ticket,
    addProductCardAttachments,
    newMessageChannel,
    isNewMessagePublic,
    currentAccount,
    productCardsEnabled,
}: ConnectedProps<typeof connector> & OwnProps) {
    const [isOpen, setOpen] = useState(false)
    const [pickedShopifyIntegration, setPickedShopifyIntegration] =
        useState(null)

    const handleResetStoreChoice = () => {
        setPickedShopifyIntegration(null)
    }

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)
        segmentTracker.logEvent(SegmentEvent.ShopifyInsertProductLinkOpen, {
            account_id: currentAccount?.get('domain'),
            channel: newMessageChannel,
            ticket: ticket?.get('id') || 'new',
        })
    }, [setOpen])

    const handlePopoverClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    const pickIntegration = (index: number) => {
        const integrationRow = integrations.toArray()[index] as Map<any, any>

        setPickedShopifyIntegration(
            fromJS({
                id: integrationRow.get('id'),
                name: integrationRow.get('name'),
                shop_domain: (integrationRow.get('meta') as Map<any, any>).get(
                    'shop_domain'
                ),
                currency: (integrationRow.get('meta') as Map<any, any>).get(
                    'currency'
                ),
            })
        )
    }

    const addProductLink = useCallback(
        (productCardDetails: ProductCardDetails) => {
            const editorState = getEditorState()
            const canAddCard =
                productCardsEnabled &&
                (newMessageChannel === (TicketChannel.Chat as string) ||
                    !isNewMessagePublic)

            if (canAddCard) {
                addProductCardAttachments(ticket, productCardDetails)
            } else {
                let newEditorState
                //Facebook/IG doesn't support hyperlinks
                if (
                    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS.includes(
                        newMessageChannel
                    )
                ) {
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

            segmentTracker.logEvent(
                SegmentEvent.ShopifyInsertProductLinkAdded,
                {
                    account_id: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    product_id: productCardDetails.productId,
                    variant_id: productCardDetails.variantId,
                    ticket: ticket?.get('id') || 'new',
                }
            )
            setOpen(false)
        },
        [
            getEditorState,
            setEditorState,
            setOpen,
            newMessageChannel,
            isNewMessagePublic,
            productCardsEnabled,
        ]
    )

    useEffect(() => {
        const integrationsArr = integrations.toArray()
        if (!pickedShopifyIntegration && integrationsArr.length === 1) {
            pickIntegration(0)
        }
        shortcutManager.bind('AddProductLink', {
            CLOSE_POPOVER: {
                key: 'esc',
                action: () => handlePopoverClose(),
            },
        })
        return function cleanup() {
            shortcutManager.unbind('AddProductLink')
        }
    }, [handlePopoverClose])

    return (
        <Popover
            icon="shopify"
            name="Insert Shopify Product"
            className={classnames(css.productLinkToolTip, 'p-0', 'd-flex')}
            isOpen={isOpen}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
        >
            {!pickedShopifyIntegration ? (
                <div className={css.productLineContainer}>
                    <ListGroup flush>
                        {integrations.map(
                            (integration: Map<any, any>, index) => (
                                <ListGroupItem
                                    key={index}
                                    tag="button"
                                    className={css.customListGroup}
                                    action
                                    onClick={(event) => {
                                        event.preventDefault()
                                        pickIntegration(index!)
                                    }}
                                >
                                    <div
                                        className={css.integrationRowContainer}
                                    >
                                        <div className={css.integrationRow}>
                                            <img
                                                className={css.shopifyLogo}
                                                alt="Shopify logo"
                                                src={getIconFromType('shopify')}
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
                    productClicked={addProductLink}
                    onResetStoreChoice={
                        integrations.size > 1
                            ? handleResetStoreChoice
                            : undefined
                    }
                    shopifyIntegration={pickedShopifyIntegration!}
                />
            )}
        </Popover>
    )
}

const connector = connect(
    (state: RootState) => ({
        currentAccount: getCurrentAccountState(state),
        ticket: state.ticket,
        newMessageChannel: getNewMessageChannel(state),
        isNewMessagePublic: isNewMessagePublic(state),
    }),
    {addProductCardAttachments}
)
export default connector(AddProductLink)
