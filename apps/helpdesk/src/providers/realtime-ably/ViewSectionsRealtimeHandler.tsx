import { useCallback, useMemo } from 'react'

import { isRecord } from '@repo/utils'

import { useChannel } from '@gorgias/realtime'
import type { ChannelNameOptions, UseChannelProps } from '@gorgias/realtime'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { syncTicketNavViewSourceSdkEvent } from 'main/init/socketEvents/ticketNavViewSourceSdkSocketSync'
import type { Section } from 'models/section/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from 'state/entities/sections/actions'

import { parseMessageData } from './parseMessageData'

export const VIEW_SECTION_CREATED_EVENT = 'view-section.created'
export const VIEW_SECTION_UPDATED_EVENT = 'view-section.updated'
export const VIEW_SECTION_DELETED_EVENT = 'view-section.deleted'

type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

function getDecoration(
    data: Record<string, unknown>,
): Section['decoration'] | undefined {
    if (data.decoration === null || data.decoration === undefined) return null

    if (!isRecord(data.decoration)) return undefined

    return {
        emoji:
            typeof data.decoration.emoji === 'string'
                ? data.decoration.emoji
                : undefined,
    }
}

function getViewSection(data: unknown): Section | undefined {
    if (!isRecord(data)) return undefined

    const decoration = getDecoration(data)

    if (
        typeof data.id !== 'number' ||
        typeof data.created_datetime !== 'string' ||
        decoration === undefined ||
        typeof data.name !== 'string' ||
        typeof data.private !== 'boolean' ||
        typeof data.updated_datetime !== 'string' ||
        typeof data.uri !== 'string'
    ) {
        return undefined
    }

    return {
        id: data.id,
        created_datetime: data.created_datetime,
        decoration,
        name: data.name,
        private: data.private,
        updated_datetime: data.updated_datetime,
        uri: data.uri,
    }
}

export function ViewSectionsRealtimeHandler() {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const dispatch = useAppDispatch()

    const accountChannel = useMemo<ChannelNameOptions | undefined>(() => {
        if (!accountId) return undefined

        return {
            name: 'account',
            accountId,
        }
    }, [accountId])

    const userChannel = useMemo<ChannelNameOptions | undefined>(() => {
        if (!accountId || !userId) return undefined

        return {
            name: 'user',
            accountId,
            userId,
        }
    }, [accountId, userId])

    const handleMessage = useCallback(
        (message: AblyMessage, isPrivateChannel: boolean) => {
            if (
                message.name !== VIEW_SECTION_CREATED_EVENT &&
                message.name !== VIEW_SECTION_UPDATED_EVENT &&
                message.name !== VIEW_SECTION_DELETED_EVENT
            ) {
                return
            }

            const viewSection = getViewSection(parseMessageData(message.data))

            if (!viewSection) return
            if (viewSection.private !== isPrivateChannel) return

            if (message.name === VIEW_SECTION_CREATED_EVENT) {
                dispatch(sectionCreated(viewSection))
                syncTicketNavViewSourceSdkEvent({
                    type: 'view-section-created',
                    section: viewSection,
                })
                return
            }

            if (message.name === VIEW_SECTION_UPDATED_EVENT) {
                dispatch(sectionUpdated(viewSection))
                syncTicketNavViewSourceSdkEvent({
                    type: 'view-section-updated',
                    section: viewSection,
                })
                return
            }

            dispatch(sectionDeleted(viewSection.id))
            syncTicketNavViewSourceSdkEvent({
                type: 'view-section-deleted',
                sectionId: viewSection.id,
            })
        },
        [dispatch],
    )

    const handleAccountMessage = useCallback(
        (message: AblyMessage) => {
            handleMessage(message, false)
        },
        [handleMessage],
    )

    const handleUserMessage = useCallback(
        (message: AblyMessage) => {
            handleMessage(message, true)
        },
        [handleMessage],
    )

    useChannel({
        channel: accountChannel,
        onMessage: handleAccountMessage,
    })

    useChannel({
        channel: userChannel,
        onMessage: handleUserMessage,
    })

    return null
}
