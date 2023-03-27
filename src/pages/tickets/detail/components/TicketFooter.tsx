import React from 'react'

import Editor from 'pages/common/editor/Editor'
import {SubmitArgs} from '../TicketDetailContainer'

import TypingActivity from './TypingActivity'

export type TicketFooterContext = {
    isShopperTyping: boolean
    shopperName: string
    submit: (params: SubmitArgs) => any
}

type Props = {
    context?: TicketFooterContext
}

export default function TicketFooter({context}: Props) {
    if (!context) return null

    const {isShopperTyping, shopperName, submit} = context

    return (
        <>
            <TypingActivity isTyping={isShopperTyping} name={shopperName} />
            <Editor submit={submit} />
        </>
    )
}
