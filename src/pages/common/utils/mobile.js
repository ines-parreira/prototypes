// @flow
import _isNull from 'lodash/isNull'

/**
 * Detect touch support
 */
let touchSupport = null
export function isTouchDevice(): ?boolean {
    if (_isNull(touchSupport)) {
        touchSupport = ('ontouchstart' in window)
    }

    return touchSupport
}

const screens = {
    small: 768,
    medium: 1024
}

function screenUnder(size: 'small' | 'medium' = 'small'): boolean {
    return window.innerWidth <= screens[size]
}

export function isMediumOrSmallScreen(): boolean {
    return screenUnder('medium')
}
