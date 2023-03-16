import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'
import {ListGroup, ListGroupItem} from 'reactstrap'
import {EditorState} from 'draft-js'
import {fromJS, List, Map} from 'immutable'

import {DISCOUNT_MODAL_NAME} from 'models/discountCodes/constants'
import {DiscountCode} from 'models/discountCodes/types'
import {insertText} from 'utils'
import DiscountCodeResults from 'pages/common/components/DiscountCodeResults/DiscountCodeResults'
import shortcutManager from 'services/shortcutManager'
import {getIconFromType} from 'state/integrations/helpers'
import {useModalManager} from 'hooks/useModalManager'

import {ActionInjectedProps} from '../types'
import {useToolbarContext} from '../ToolbarContext'
import {addDiscountCodeLink} from '../../utils'
import Popover from './ButtonPopover'

import css from './AddDiscountCode.less'

type Props = {
    integrations: List<any>
} & ActionInjectedProps

const mapIntegrationToPickedIntegration = (integration: Map<any, any>) => {
    return fromJS({
        id: integration.get('id'),
        name: integration.get('name'),
        shop_domain: integration.getIn(['meta', 'shop_domain']),
        currency: integration.getIn(['meta', 'currency']),
        oauth: integration.getIn(['meta', 'oauth']),
    }) as Map<any, any>
}

const AddDiscountCode = ({
    integrations,
    getEditorState,
    setEditorState,
}: Props) => {
    const {
        canAddDiscountCodeLink,
        onInsertDiscountCodeOpen,
        onInsertDiscountCodeAdded,
    } = useToolbarContext()
    const [isOpen, setOpen] = useState(false)
    const [pickedIntegration, setPickedIntegration] = useState(() => {
        if (integrations.size === 1) {
            return mapIntegrationToPickedIntegration(
                integrations.get(0) as Map<any, any>
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

    const handleAddDiscountCode = useCallback(
        (event: React.MouseEvent<HTMLElement>, discount: DiscountCode) => {
            event.preventDefault()

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
            setOpen(false)
        },
        [
            getEditorState,
            setEditorState,
            canAddDiscountCodeLink,
            onInsertDiscountCodeAdded,
        ]
    )

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
                <DiscountCodeResults
                    onDiscountClicked={handleAddDiscountCode}
                    onResetStoreChoice={
                        integrations.size > 1
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
