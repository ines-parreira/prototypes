import { vi } from 'vitest'

import { triggerWidthResize } from '../triggerWidthResize'

describe('triggerResize', () => {
    it('should trigger a resize event', () => {
        const callback = vi.fn()
        window.addEventListener('resize', callback)
        triggerWidthResize(1000)
        expect(callback).toHaveBeenCalledTimes(1)
    })
})
