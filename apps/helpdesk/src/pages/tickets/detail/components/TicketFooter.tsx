import { useCallback, useMemo } from 'react'

import cn from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import WhatsAppEditorProvider from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { getTicket } from 'state/ticket/selectors'
import { editorFocused } from 'state/ui/editor/actions'

import type { SubmitArgs } from '../TicketDetailContainer'
import TypingActivity from './TypingActivity'

export type TicketFooterContext = {
    isShopperTyping: boolean
    shopperName: string
    submit: (params: SubmitArgs) => any
}

type Props = {
    context?: TicketFooterContext
}

export default function TicketFooter({ context }: Props) {
    const dispatch = useAppDispatch()
    const ticket = useAppSelector(getTicket)
    const initialMacroFilters = useInitialMacroFilters()
    const { accessFeaturesMapped, isStandaloneAiAgent } =
        useStandaloneAiAccess()

    const isExistingTicket = useMemo(() => !!ticket.id, [ticket])
    const canCreateInternalNote =
        !isStandaloneAiAgent ||
        accessFeaturesMapped.ticketsView.canCreateInternalNote
    const canWriteToTicket =
        !isStandaloneAiAgent || accessFeaturesMapped.ticketsView.canWrite
    const internalNotesOnly = canCreateInternalNote && !canWriteToTicket

    const handleBlur = useCallback(() => {
        dispatch(editorFocused(false))
    }, [dispatch])

    const handleFocus = useCallback(() => {
        dispatch(editorFocused(true))
    }, [dispatch])

    if (!context) return null

    const { isShopperTyping, shopperName, submit } = context

    return (
        <div className={cn({ 'mt-3': !isExistingTicket })}>
            <TypingActivity isTyping={isShopperTyping} name={shopperName} />
            <WhatsAppEditorProvider>
                <Editor
                    canEdit={canCreateInternalNote || canWriteToTicket}
                    internalNotesOnly={internalNotesOnly}
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
