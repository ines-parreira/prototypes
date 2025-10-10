import '@testing-library/jest-dom/vitest'

import { setImmediate } from 'timers'

Object.defineProperty(window, 'ResizeObserver', {
    value: function () {
        return {
            observe: () => null,
            disconnect: () => null,
            unobserve: () => null,
        }
    },
    writable: true,
})
global.setImmediate = setImmediate
