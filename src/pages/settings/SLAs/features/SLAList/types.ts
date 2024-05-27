import {DropTargetMonitor} from 'react-dnd'
import {SLAPolicy} from '@gorgias/api-queries'

import {TicketChannel} from 'business/types/ticket'
import {DragItemRequired} from 'pages/common/hooks/useReorderDnD'

export type UISLAPolicy = {
    uuid: string
    name: string
    channels: TicketChannel[] | null
    isActive: boolean
    updatedDatetime: string | null
    priority: number
}

export enum TableColumn {
    PolicyName = 'policy_name',
    UpdatedDatetime = 'updated_datetime',
    Channels = 'channels',
}

export type PolicyDragItem = DragItemRequired & {id: SLAPolicy['uuid']}

export type OnTogglePolicyFn = (id: string, active: boolean) => void

export type OnMovePolicyFn = (dragIndex: number, hoverIndex: number) => void

export type OnPolicyPriorityChangeFn = (id: string, priority: number) => void

export type OnDropPolicyFn = (
    item: PolicyDragItem,
    monitor: DropTargetMonitor
) => void
