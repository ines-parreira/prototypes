import React, {Fragment, ReactNode} from 'react'
import hash from 'object-hash'

import {renderTemplate} from './template'

const iconRegex = /\B(:\w+:)\B/gi

const icons = {
    ':cart:': 'shopping_cart',
    ':product:': 'local_mall',
    ':refund:': 'attach_money',
    ':shipment_status:': 'local_shipping',
    ':shipping_address:': 'home',
    ':shipping_cost:': 'widgets',
    ':information:': 'info',
    ':contact:': 'contact_page',
    ':campaign:': 'send',
}

type IconName = keyof typeof icons

const isValidIcon = (value: string): value is IconName => value in icons

/**
 * Render a template like: `Order {self.id}` to `Order 37337`.
 * Then render icons (for instance `":shipping_address:"`).
 *
 */
export const renderInfobarTemplate = (
    body: string,
    context: Record<string, Maybe<string>> = {}
): ReactNode => {
    return renderTemplate(body, context)
        .split(iconRegex)
        .filter((part) => !!part)
        .map((part) => {
            const key = hash(part)

            if (isValidIcon(part) && icons[part]) {
                return (
                    <i key={key} className="material-icons">
                        {icons[part]}
                    </i>
                )
            }

            return <Fragment key={key}>{part}</Fragment>
        })
}
