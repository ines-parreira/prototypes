import analyticsColors from 'assets/css/new/stats/modern.json'

export const SLA_PAGE_TITLE = 'SLAs'

export const CHART_COLORS = [
    analyticsColors['analytics'].data.turquoise.value,
    analyticsColors['analytics'].data.yellow.value,
]

export enum VoiceSLAStatus {
    Breached = '1',
    Satisfied = '0',
}
