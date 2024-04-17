import React, {useCallback, useEffect, useState, useMemo} from 'react'
import classnames from 'classnames'
import {ListGroup, ListGroupItem} from 'reactstrap'
import {EditorState} from 'draft-js'
import {fromJS, Map} from 'immutable'

import {DISCOUNT_MODAL_NAME} from 'models/discountCodes/constants'
import {
    DiscountCode,
    discountCodeIsGeneric,
    discountCodeIsUnique,
} from 'models/discountCodes/types'
import {insertText} from 'utils'
import shortcutManager from 'services/shortcutManager'
import {getIconFromType} from 'state/integrations/helpers'
import {useModalManager} from 'hooks/useModalManager'

import {DiscountCodeResultsWrapper} from 'pages/common/components/DiscountCodeResultsWrapper/DiscountCodeResultsWrapper'
import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'
import {ActionInjectedProps, ActionName} from '../types'
import {useToolbarContext} from '../ToolbarContext'
import {getTooltipTourConfiguration} from '../utils'
import {addDiscountCodeLink} from '../../utils'
import Popover from './ButtonPopover'

import css from './AddDiscountCode.less'

type Props = ActionInjectedProps

const mapIntegrationToPickedIntegration = (integration: Map<any, any>) => {
    return fromJS({
        id: integration.get('id'),
        name: integration.get('name'),
        shop_domain: integration.getIn(['meta', 'shop_domain']),
        currency: integration.getIn(['meta', 'currency']),
        oauth: integration.getIn(['meta', 'oauth']),
    }) as Map<any, any>
}

const AddDiscountCode = ({getEditorState, setEditorState}: Props) => {
    const {
        canAddDiscountCodeLink,
        onInsertDiscountCodeOpen,
        onInsertDiscountCodeAdded,
        shopifyIntegrations,
        toolbarTour,
    } = useToolbarContext()
    const [isOpen, setOpen] = useState(false)
    const [pickedIntegration, setPickedIntegration] = useState(() => {
        if (shopifyIntegrations.size === 1) {
            return mapIntegrationToPickedIntegration(
                shopifyIntegrations.get(0) as Map<any, any>
            )
        }

        return null
    })

    const discountModal = useModalManager(DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    const handleResetStoreChoice = () => {
        setPickedIntegration(null)
    }

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)

        onInsertDiscountCodeOpen()
    }, [onInsertDiscountCodeOpen])

    const handlePopoverClose = useCallback(() => {
        setOpen(discountModal.isOpen(DISCOUNT_MODAL_NAME))
    }, [discountModal])

    const handlePickIntegration = useCallback((integration: Map<any, any>) => {
        setPickedIntegration(mapIntegrationToPickedIntegration(integration))
    }, [])

    const handleAddGenericDiscountCode = useCallback(
        (discount: DiscountCode) => {
            const editorState = getEditorState()

            let newEditorState
            if (discount.shareable_url && canAddDiscountCodeLink) {
                newEditorState = addDiscountCodeLink(
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

            onInsertDiscountCodeAdded(discount)
        },
        [
            canAddDiscountCodeLink,
            getEditorState,
            onInsertDiscountCodeAdded,
            setEditorState,
        ]
    )

    // TODO: Implement once unique offer creation is implemented
    const handleAddUniqueDiscountOffer = (offer: UniqueDiscountOffer) => {
        // eslint-disable-next-line no-console
        console.info(offer)
    }

    const handleAddDiscountCode = useCallback(
        (
            event: React.MouseEvent<HTMLElement>,
            discount: DiscountCode | UniqueDiscountOffer
        ) => {
            event.preventDefault()

            if (discountCodeIsGeneric(discount)) {
                handleAddGenericDiscountCode(discount)
            } else if (discountCodeIsUnique(discount)) {
                handleAddUniqueDiscountOffer(discount)
            }
            // TODO: Add logic for unique discount code
            setOpen(false)
        },
        [handleAddGenericDiscountCode]
    )

    const tour = useMemo(() => {
        return getTooltipTourConfiguration(
            ActionName.DiscountCodePicker,
            toolbarTour
        )
    }, [toolbarTour])

    useEffect(() => {
        shortcutManager.bind('AddDiscountCode', {
            CLOSE_POPOVER: {
                key: 'esc',
                action: () => handlePopoverClose(),
            },
        })
        return () => {
            shortcutManager.unbind('AddDiscountCode')
        }
    }, [handlePopoverClose])

    return (
        <Popover
            icon="discount"
            name="Insert Discount Code"
            tour={tour}
            isOpen={isOpen}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
        >
            {!pickedIntegration ? (
                <div className={css.discountLineContainer}>
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
                <DiscountCodeResultsWrapper
                    onDiscountClicked={handleAddDiscountCode}
                    onResetStoreChoice={
                        shopifyIntegrations.size > 1
                            ? handleResetStoreChoice
                            : undefined
                    }
                    integration={pickedIntegration}
                />
            )}
        </Popover>
    )
}

export default AddDiscountCode
