import type { ValueOf } from '@repo/types'

export const DisplayedContent = {
    Original: 'original',
    Translated: 'translated',
} as const

export const FetchingState = {
    Idle: 'idle',
    Loading: 'loading',
    Completed: 'completed',
    Failed: 'failed',
}

export type DisplayType = {
    display: ValueOf<typeof DisplayedContent>
    fetchingState: ValueOf<typeof FetchingState>
    hasRegeneratedOnce: boolean
}
