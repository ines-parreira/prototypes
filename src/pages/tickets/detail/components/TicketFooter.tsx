import cn from 'classnames'
import React, {useCallback, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import WhatsAppEditorProvider from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider'
import {getTicket} from 'state/ticket/selectors'
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
    const ticket = useAppSelector(getTicket)
    const initialMacroFilters = useInitialMacroFilters()

    const isExistingTicket = useMemo(() => !!ticket.id, [ticket])

    const handleBlur = useCallback(() => {
        dispatch(editorFocused(false))
    }, [dispatch])

    const handleFocus = useCallback(() => {
        dispatch(editorFocused(true))
    }, [dispatch])

    if (!context) return null

    const {isShopperTyping, shopperName, submit} = context

    return (
        <div className={cn({'mt-3': !isExistingTicket})}>
            <TypingActivity isTyping={isShopperTyping} name={shopperName} />
            <WhatsAppEditorProvider>
                <Editor
                    initialMacroFilters={initialMacroFilters}
                    submit={submit}
                    ticket={ticket}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                />
            </WhatsAppEditorProvider>
        </div>
    )
}
