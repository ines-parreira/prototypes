import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'
import {ListGroup, ListGroupItem} from 'reactstrap'
import {EditorState} from 'draft-js'
import {fromJS, List, Map} from 'immutable'

import {DISCOUNT_MODAL_NAME} from 'models/discountCodes/constants'
import {DiscountCode} from 'models/discountCodes/types'
import {insertLink, insertText} from 'utils'
import DiscountCodeResults from 'pages/common/components/DiscountCodeResults/DiscountCodeResults'
import shortcutManager from 'services/shortcutManager'
import {getNewMessageChannel} from 'state/newMessage/selectors'
import {getIconFromType} from 'state/integrations/helpers'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {
    EditorStateGetter,
    EditorStateSetter,
} from 'pages/common/draftjs/plugins/toolbar/types'
import {UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS} from 'config/integrations/shopify'
import {getTicket} from 'state/ticket/selectors'
import {useModalManager} from 'hooks/useModalManager'
import useAppSelector from 'hooks/useAppSelector'
import css from './AddDiscountCode.less'
import Popover from './ButtonPopover'

type OwnProps = {
    getEditorState: EditorStateGetter
    setEditorState: EditorStateSetter
    integrations: List<any>
}

export function AddDiscountCode({
    integrations,
    getEditorState,
    setEditorState,
}: OwnProps) {
    const [isOpen, setOpen] = useState(false)
    const [pickedIntegration, setPickedIntegration] = useState(null)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const newMessageChannel = useAppSelector(getNewMessageChannel)
    const ticket = useAppSelector(getTicket)

    const discountModal = useModalManager(DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    const handleResetStoreChoice = () => {
        setPickedIntegration(null)
    }

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)
        logEvent(SegmentEvent.InsertDiscountCodeOpen, {
            account_id: currentAccount?.get('domain'),
            channel: newMessageChannel,
            ticket: ticket.id || 'new',
        })
    }, [currentAccount, newMessageChannel, ticket])

    const handlePopoverClose = useCallback(() => {
        setOpen(discountModal.isOpen(DISCOUNT_MODAL_NAME))
    }, [discountModal])

    const pickIntegration = useCallback(
        (index: number) => {
            const integrationRow = integrations.toArray()[index] as Map<
                any,
                any
            >

            setPickedIntegration(
                fromJS({
                    id: integrationRow.get('id'),
                    name: integrationRow.get('name'),
                    shop_domain: (
                        integrationRow.get('meta') as Map<any, any>
                    ).get('shop_domain'),
                    currency: (integrationRow.get('meta') as Map<any, any>).get(
                        'currency'
                    ),
                    oauth: integrationRow.getIn(['meta', 'oauth']),
                })
            )
        },
        [integrations]
    )

    const addDiscountCode = useCallback(
        (event: React.MouseEvent<HTMLElement>, discount: DiscountCode) => {
            event.preventDefault()

            const editorState = getEditorState()

            let newEditorState
            if (
                discount.shareable_url &&
                !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS.includes(
                    newMessageChannel
                )
            ) {
                newEditorState = insertLink(
                    editorState,
                    discount.shareable_url,
                    discount.code
                )
            } else {
                newEditorState = insertText(editorState, discount.code)
            }
            newEditorState = EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection()
            )
            setEditorState(newEditorState)

            logEvent(SegmentEvent.InsertDiscountCodeAdded, {
                account_id: currentAccount?.get('domain'),
                channel: newMessageChannel,
                discount_id: discount.id,
                ticket: ticket.id || 'new',
            })
            setOpen(false)
        },
        [
            getEditorState,
            setEditorState,
            currentAccount,
            newMessageChannel,
            ticket,
        ]
    )

    useEffect(() => {
        const integrationsArr = integrations.toArray()
        if (!pickedIntegration && integrationsArr.length === 1) {
            pickIntegration(0)
        }
        shortcutManager.bind('AddDiscountCode', {
            CLOSE_POPOVER: {
                key: 'esc',
                action: () => handlePopoverClose(),
            },
        })
        return function cleanup() {
            shortcutManager.unbind('AddDiscountCode')
        }
    }, [handlePopoverClose, integrations, pickIntegration, pickedIntegration])

    return (
        <Popover
            icon="discount"
            id="insert_discount_code"
            name="Insert Discount Code"
            className={classnames(css.discountCodeToolTip, 'p-0', 'd-flex')}
            isOpen={isOpen}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
        >
            {!pickedIntegration ? (
                <div className={css.discountLineContainer}>
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
                                                alt="Logo"
                                                src={getIconFromType(
                                                    integration.get('type')
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
                <DiscountCodeResults
                    onDiscountClicked={addDiscountCode}
                    onResetStoreChoice={
                        integrations.size > 1
                            ? handleResetStoreChoice
                            : undefined
                    }
                    integration={pickedIntegration!}
                />
            )}
        </Popover>
    )
}

export default AddDiscountCode
