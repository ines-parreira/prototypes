import React from 'react'

import {PlaygroundTemplateMessage} from '../../types'
import css from './PlaygroundPredefinedMessages.less'
import {PredefinedMessageItem} from './PredefinedMessageItem'

const TEMPLATE_MESSAGES: PlaygroundTemplateMessage[] = [
    {
        id: 1,
        title: 'Discounts',
        content:
            "Hi there,<br/>I hope you're doing well! I've been browsing some products on your website. Before I make a purchase, I wanted to check if you currently have any discounts or special offers available. Could you please provide some information on this?<br/>Best regards",
    },
    {
        id: 2,
        title: 'Order Status',
        content:
            "Hi there,<br/>I hope you're doing well! I recently placed an order on your website. I’m excited to receive my items and wanted to check on the status of my order. Could you please provide an update?<br/>Best regards",
    },
    {
        id: 3,
        title: 'International Shipping',
        content:
            "Hi there,<br/>I hope you're doing well! I'm interested in purchasing some products from your website. Before I proceed, I wanted to know if you offer international shipping. Could you please let me know if you ship to France and any details related to international shipping costs and delivery times?<br/>Best regards",
    },
    {
        id: 4,
        title: 'Warranty Policy',
        content:
            "Hi there,<br/>I hope you're doing well! I've been eyeing some products on your website. Before I hit that 'buy' button, I wanted to check in about your warranty policy, what do you offer! <br/>Best regards",
    },
]

type Props = {
    onMessageSelect: (predefinedMessage: PlaygroundTemplateMessage) => void
}

export const PlaygroundPredefinedMessages = ({onMessageSelect}: Props) => {
    return (
        <div className={css.container}>
            <span className={css.title}>Test a common question</span>
            <ul className={css.list}>
                {TEMPLATE_MESSAGES.map((message, index) => (
                    <li key={index}>
                        <PredefinedMessageItem
                            message={message}
                            onMessageSelect={onMessageSelect}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}
