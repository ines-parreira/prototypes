import type { IconName } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

export type SystemViewDefinition = {
    name: string
    label: string
    icon: IconName
}

export type ViewsVisibilityData = {
    hidden_views: number[]
}

export type SystemView = View & {
    id: NonNullable<View['id']>
    name: NonNullable<View['name']>
}
