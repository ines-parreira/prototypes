import type { View } from '@gorgias/helpdesk-types'

import type { ViewSection } from '../types'
import {
    syncViewSectionCreated,
    syncViewSectionDeleted,
    syncViewSectionUpdated,
} from './viewSectionStore'
import { syncViewCreated, syncViewDeleted, syncViewUpdated } from './viewStore'

export type ViewRealtimeEventView = object & { id: number }
export type ViewRealtimeEventSection = object

export type ViewRealtimeEvent =
    | {
          type: 'view-created'
          view: ViewRealtimeEventView
          isViewVisibleToCurrentUser: boolean
      }
    | {
          type: 'view-updated'
          view: ViewRealtimeEventView
          isViewVisibleToCurrentUser: boolean
      }
    | {
          type: 'view-deleted'
          viewId: number
      }
    | {
          type: 'view-section-created'
          section: ViewRealtimeEventSection
      }
    | {
          type: 'view-section-updated'
          section: ViewRealtimeEventSection
      }
    | {
          type: 'view-section-deleted'
          sectionId: number
      }

export function syncViewRealtimeEvent(event: ViewRealtimeEvent) {
    switch (event.type) {
        case 'view-created':
            if (event.isViewVisibleToCurrentUser) {
                syncViewCreated(event.view as View)
            } else {
                syncViewDeleted(event.view.id)
            }
            break
        case 'view-updated':
            if (event.isViewVisibleToCurrentUser) {
                syncViewUpdated(event.view as View)
            } else {
                syncViewDeleted(event.view.id)
            }
            break
        case 'view-deleted':
            syncViewDeleted(event.viewId)
            break
        case 'view-section-created':
            syncViewSectionCreated(event.section as ViewSection)
            break
        case 'view-section-updated':
            syncViewSectionUpdated(event.section as ViewSection)
            break
        case 'view-section-deleted':
            syncViewSectionDeleted(event.sectionId)
            break
    }
}
