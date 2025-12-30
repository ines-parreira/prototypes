import type { ValueOf } from '@repo/types'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { DisplayedContent, FetchingState } from './constants'
import type { DisplayType } from './constants'

export type TicketMessagesTranslationDisplay = Record<number, DisplayType>

type TicketMessagesTranslationDisplayStore = {
    ticketMessagesTranslationDisplayMap: TicketMessagesTranslationDisplay
    allMessageDisplayState: ValueOf<typeof DisplayedContent>
    getTicketMessageTranslationDisplay: (messageId: number) => DisplayType
    setTicketMessageTranslationDisplay: (
        messagesToUpdate: (DisplayType & {
            messageId: number
        })[],
    ) => void
    setAllTicketMessagesToOriginal: () => void
    setAllTicketMessagesToTranslated: () => void
}

export const useTicketMessageTranslationDisplay =
    create<TicketMessagesTranslationDisplayStore>((set, get) => ({
        ticketMessagesTranslationDisplayMap: {},
        allMessageDisplayState: DisplayedContent.Translated,

        getTicketMessageTranslationDisplay: (messageId: number) => {
            const state = get()
            return (
                state.ticketMessagesTranslationDisplayMap[messageId] ?? {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                }
            )
        },

        setTicketMessageTranslationDisplay: (
            messagesToUpdate: (DisplayType & {
                messageId: number
            })[],
        ) => {
            set((state) => {
                const newMap = { ...state.ticketMessagesTranslationDisplayMap }
                for (const message of messagesToUpdate) {
                    newMap[message.messageId] = message
                }
                return { ticketMessagesTranslationDisplayMap: newMap }
            })
        },

        setAllTicketMessagesToOriginal: () => {
            set((state) => {
                const newMap = { ...state.ticketMessagesTranslationDisplayMap }
                for (const messageId in newMap) {
                    newMap[messageId] = {
                        ...newMap[messageId],
                        display: DisplayedContent.Original,
                    }
                }
                return {
                    ticketMessagesTranslationDisplayMap: newMap,
                    allMessageDisplayState: DisplayedContent.Original,
                }
            })
        },

        setAllTicketMessagesToTranslated: () => {
            set((state) => {
                const newMap = { ...state.ticketMessagesTranslationDisplayMap }
                for (const messageId in newMap) {
                    newMap[messageId] = {
                        ...newMap[messageId],
                        display: DisplayedContent.Translated,
                    }
                }
                return {
                    ticketMessagesTranslationDisplayMap: newMap,
                    allMessageDisplayState: DisplayedContent.Translated,
                }
            })
        },
    }))

export function useTicketMessageDisplayState(messageId: number) {
    return useTicketMessageTranslationDisplay(
        useShallow((state) => {
            const messageState =
                state.ticketMessagesTranslationDisplayMap[messageId]
            return {
                display: messageState?.display ?? DisplayedContent.Original,
                fetchingState:
                    messageState?.fetchingState ?? FetchingState.Idle,
                hasRegeneratedOnce: messageState?.hasRegeneratedOnce ?? false,
                setTicketMessageTranslationDisplay:
                    state.setTicketMessageTranslationDisplay,
            }
        }),
    )
}
