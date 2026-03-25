import { tryLocalStorage } from '@repo/browser-storage'
import _debounce from 'lodash/debounce'

import {
    LayoutKeys,
    PANELS_STORAGE_DEBOUNCE_TIME,
} from 'split-ticket-view/constants'

const storePanelWidths = _debounce(
    (layoutKey: LayoutKeys, widths: number[]) => {
        if (widths.length >= 2) {
            tryLocalStorage(() => {
                window.localStorage.setItem(
                    'navbar-width',
                    widths[0].toString(),
                )

                if ([LayoutKeys.TICKET, LayoutKeys.VIEW].includes(layoutKey)) {
                    window.localStorage.setItem(
                        'ticket-list-width',
                        `v2;${widths[1]}`,
                    )
                }

                window.localStorage.setItem(
                    layoutKey,
                    `v2;${widths.toString()}`,
                )
            })
        }

        if (layoutKey === LayoutKeys.TICKET && widths.length === 4) {
            tryLocalStorage(() => {
                window.localStorage.setItem(
                    'infobar-width',
                    widths[3].toString(),
                )
            })
        }

        if (layoutKey === LayoutKeys.FULL_TICKET && widths.length === 3) {
            tryLocalStorage(() => {
                window.localStorage.setItem(
                    'infobar-width',
                    widths[2].toString(),
                )
            })
        }
    },
    PANELS_STORAGE_DEBOUNCE_TIME,
)

export default storePanelWidths
