/*
 * Force scroll to the focused input element,
 * when the onscreen keyboard pops up mobile.
 */

import {isEditable} from './common/utils'
import {isTouchDevice, isMediumOrSmallScreen} from '../pages/common/utils/mobile'

window.addEventListener('focusin', () => {
    // if focused element is editable,
    // and we're on medium screen touch device.
    if(isEditable(document.activeElement) && isTouchDevice() && isMediumOrSmallScreen()) {
        setTimeout(() => {
            document.activeElement.scrollIntoView()
        })
    }
})

export default {}
