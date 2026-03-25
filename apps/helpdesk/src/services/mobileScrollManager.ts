/*
 * Force scroll to the focused input element,
 * when the onscreen keyboard pops up mobile.
 */
import { isEditable } from '@repo/utils'

import {
    isMediumOrSmallScreen,
    isTouchDevice,
} from '../pages/common/utils/mobile'

window.addEventListener('focusin', () => {
    // if focused element is editable,
    // and we're on medium screen touch device.
    if (
        !!document.activeElement &&
        isEditable(document.activeElement) &&
        isTouchDevice() &&
        isMediumOrSmallScreen()
    ) {
        setTimeout(() => {
            document.activeElement!.scrollIntoView()
        })
    }
})

const mobileScrollManager = {}

export default mobileScrollManager
