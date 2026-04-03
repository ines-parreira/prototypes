import { useMemo } from 'react'

import { DurationInMs } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import { useViews } from './useViews'

export type SystemView = View & {
    id: number
    name: string
    icon: IconName | null
}

export function useSystemViews(): SystemView[] {
    const { views } = useViews(
        { category: 'system' },
        { query: { staleTime: DurationInMs.OneDay } },
    )

    return useMemo(
        () =>
            views
                .filter((v): v is View & { name: string } => !!v.name)
                .map((v) => ({
                    ...v,
                    icon: ICON_BY_NAME.get(v.name) ?? null,
                })),
        [views],
    )
}

const ICON_BY_NAME = new Map<string, IconName>([
    ['Inbox', 'user-arrow'],
    ['Unassigned', 'folder-remove'],
    ['All', 'inbox'],
    ['Snoozed', 'timer-snooze'],
    ['Closed', 'circle-check'],
    ['Trash', 'trash-empty'],
    ['Spam', 'octagon-error'],
])
