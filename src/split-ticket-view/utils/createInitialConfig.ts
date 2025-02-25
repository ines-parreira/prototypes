import { Config } from 'panels/types'
import { createConfig } from 'panels/utils'

import { LayoutKeys } from '../constants'

const createInitialConfig = (layoutKey: LayoutKeys, defaultConfig: Config) => {
    // this is a temporary value that will be fully replaced by the storedWidths value
    const navbarWidth = window.localStorage.getItem('navbar-width')
    let ticketListWidth = window.localStorage.getItem('ticket-list-width')
    const infobarWidth = window.localStorage.getItem('infobar-width')

    let storedWidths = window.localStorage.getItem(layoutKey)

    if (ticketListWidth) {
        const splitTicketListWidth = ticketListWidth.split(';')
        if (
            splitTicketListWidth.length === 2 &&
            splitTicketListWidth[0] === 'v2'
        ) {
            ticketListWidth = splitTicketListWidth[1]
        } else {
            ticketListWidth = null
        }
    }

    if (storedWidths) {
        const splitStoredWidths = storedWidths.split(';')
        if (splitStoredWidths.length === 2 && splitStoredWidths[0] === 'v2') {
            storedWidths = splitStoredWidths[1]
        } else {
            storedWidths = null
        }
    }

    if (storedWidths) {
        const widths = storedWidths.split(',').map(Number)
        if (navbarWidth) {
            widths[0] = Number(navbarWidth)
        }

        if (
            ticketListWidth &&
            [LayoutKeys.VIEW, LayoutKeys.TICKET].includes(layoutKey)
        ) {
            widths[1] = Number(ticketListWidth)
        }

        if (infobarWidth) {
            if (layoutKey === LayoutKeys.TICKET) {
                widths[3] = Number(infobarWidth)
            }

            if (layoutKey === LayoutKeys.FULL_TICKET) {
                widths[2] = Number(infobarWidth)
            }
        }

        return createConfig(widths, defaultConfig)
    } else if (
        navbarWidth &&
        ticketListWidth &&
        infobarWidth &&
        defaultConfig.length > 2
    ) {
        return createConfig(
            [
                Number(navbarWidth),
                Number(ticketListWidth),
                defaultConfig[2][0],
                Number(infobarWidth),
            ],
            defaultConfig,
        )
    }

    return defaultConfig
}

export default createInitialConfig
