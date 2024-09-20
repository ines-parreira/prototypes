import React from 'react'
import {ToneOfVoice} from '../constants'

export const CUSTOMER_NAME = 'Alex'
export const CUSTOMER_LAST_NAME = 'Home'
export const TICKET_PREVIEW: Record<
    ToneOfVoice,
    {greetings?: string; message: JSX.Element}
> = {
    Friendly: {
        greetings: 'Hey',
        message: (
            <div>
                <p>
                    We totally get it—sometimes things just don't work out. You
                    can return your items within 30 days of purchase for a full
                    refund or exchange, as long as they're unused and in their
                    original packaging.
                </p>
                <p>Feel free to reach out if you have any questions!</p>
            </div>
        ),
    },
    Professional: {
        greetings: 'Hi',
        message: (
            <div>
                <p>
                    We accept returns within 30 days of purchase for a full
                    refund or exchange, provided the items are unused and in
                    their original packaging.
                </p>
                <p>
                    If you have any questions or need further assistance, please
                    feel free to reach out.
                </p>
            </div>
        ),
    },
    Sophisticated: {
        greetings: 'Dear',
        message: (
            <div>
                <p>
                    We are pleased to inform you that we accept returns within
                    30 days of purchase for a full refund or exchange,
                    contingent upon the items being unused and in their original
                    packaging.
                </p>
                <p>
                    Should you require any further assistance or have additional
                    inquiries, please do not hesitate to reach out.
                </p>
            </div>
        ),
    },
    Custom: {
        message: (
            <div>
                <i>
                    [Preview for custom tone of voice is not available yet, but
                    coming soon!]
                </i>
            </div>
        ),
    },
}
