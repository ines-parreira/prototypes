import { Duration } from '@gorgias/toolkit'
export enum LayoutKeys {
    TICKET = 'ticket_layout-panels-widths',
    FULL_TICKET = 'full_ticket_layout-panels-widths',
    VIEW = 'view_layout-panels-widths',
}

export const PANELS_STORAGE_DEBOUNCE_TIME = Duration.millis(300)

export const DEFAULT_NAVBAR_WIDTH = 238
export const DEFAULT_TICKET_PANEL_WIDTH = 300
export const DEFAULT_INFOBAR_WIDTH = 340
