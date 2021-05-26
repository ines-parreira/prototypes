// @flow

import React, {Fragment, type Node} from 'react'
import hash from 'object-hash'

import {renderTemplate} from './template'

const iconRegex = /\B(:\w+:)\B/gi

const icons = {
    ':cart:': 'shopping_cart',
    ':product:': 'local_mall',
    ':refund:': 'redeem',
    ':shipment_status:': 'local_shipping',
    ':shipping_address:': 'home',
    ':shipping_cost:': 'widgets',
    ':information:': 'info',
    ':contact:': 'contact_page',
    ':campaign:': 'send',
}

/**
 * Render a template like: `Order {self.id}` to `Order 37337`.
 * Then render icons (for instance `":shipping_address:"`).
 *
 * @param body: the text in which to replace variables and icons
 * @param context: the context containing values to render the body
 * @returns {Node}
 */
export const renderInfobarTemplate = (body: string, context: {} = {}): Node => {
    return renderTemplate(body, context)
        .split(iconRegex)
        .filter((part) => !!part)
        .map((part) => {
            const key = hash(part)

            if (icons[part]) {
                return (
                    <i key={key} className="material-icons">
                        {icons[part]}
                    </i>
                )
            }

            return <Fragment key={key}>{part}</Fragment>
        })
}
