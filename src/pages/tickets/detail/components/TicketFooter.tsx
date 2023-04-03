import React, {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import Editor from 'pages/common/editor/Editor'
import {editorFocused} from 'state/ui/editor/actions'

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
    const dispatch = useAppDispatch()

    const handleBlur = useCallback(() => {
        dispatch(editorFocused(false))
    }, [dispatch])

    const handleFocus = useCallback(() => {
        dispatch(editorFocused(true))
    }, [dispatch])

    if (!context) return null

    const {isShopperTyping, shopperName, submit} = context

    return (
        <>
            <TypingActivity isTyping={isShopperTyping} name={shopperName} />
            <Editor submit={submit} onBlur={handleBlur} onFocus={handleFocus} />
        </>
    )
}
