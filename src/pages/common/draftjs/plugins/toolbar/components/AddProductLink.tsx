import React, {useEffect, useState, useCallback} from 'react'

import classnames from 'classnames'

import {fromJS, Map, List} from 'immutable'
import {ListGroup, ListGroupItem} from 'reactstrap'

import ShopifyProductLine from '../../../../components/ShopifyProductLine/ShopifyProductLine'

import shortcutManager from '../../../../../../services/shortcutManager'

import {EditorStateGetter, EditorStateSetter} from '../types'

import {getIconFromType} from '../../../../../../state/integrations/helpers'

import Popover from './ButtonPopover'
import css from './AddProductLink.less'

type OwnProps = {
    getEditorState: EditorStateGetter
    setEditorState: EditorStateSetter
    integrations: List<any>
}

export default function AddProductLink({integrations}: OwnProps) {
    const [isOpen, setOpen] = useState(false)
    const [pickedShopifyIntegration, setPickedShopifyIntegration] = useState(
        null
    )

    const handleResetStoreChoice = () => {
        setPickedShopifyIntegration(null)
    }

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)
    }, [setOpen])

    const handlePopoverClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    const handleIntegrationClicked = (index: number) => {
        const integrationsArr = integrations.toArray()[index] as Map<any, any>

        setPickedShopifyIntegration(
            fromJS({
                id: integrationsArr.get('id'),
                name: integrationsArr.get('name'),
                shop_domain: (integrationsArr.get('meta') as Map<any, any>).get(
                    'shop_domain'
                ),
            })
        )
    }

    useEffect(() => {
        const integrationsArr = integrations.toArray()
        if (!pickedShopifyIntegration && integrationsArr.length === 1) {
            setPickedShopifyIntegration(integrationsArr[0])
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
                                        handleIntegrationClicked(index!)
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
