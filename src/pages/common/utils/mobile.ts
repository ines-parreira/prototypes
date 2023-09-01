import _isNull from 'lodash/isNull'

let touchSupport: boolean | null = null
export function isTouchDevice(): boolean {
    if (_isNull(touchSupport)) {
        touchSupport = 'ontouchstart' in window
    }

    return touchSupport
}

const screens = {
    small: 768,
    medium: 1024,
    large: 1200,
    xlarge: 1450,
}

function screenUnder(
    size: 'small' | 'medium' | 'large' | 'xlarge' = 'small'
): boolean {
    return window.innerWidth <= screens[size]
}

export function isMediumOrSmallScreen(): boolean {
    return screenUnder('medium')
}

export function isExtraLargeScreen() {
    return screenUnder('xlarge')
}
