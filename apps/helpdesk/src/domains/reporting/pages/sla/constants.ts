import analyticsColors from 'assets/css/new/stats/modern.json'

export const SLA_PAGE_TITLE = 'SLAs'

export const DOWNLOAD_TICKET_DATA_BUTTON_LABEL = 'Download tickets data'
export const DOWNLOAD_VOICE_CALLS_DATA_BUTTON_LABEL = 'Download calls data'

export const CHART_COLORS = [
    analyticsColors['analytics'].data.turquoise.value,
    analyticsColors['analytics'].data.yellow.value,
]

export enum VoiceSLAStatus {
    Breached = 'breached',
    Satisfied = 'achieved',
}
