import isFullWidthViewPath from '../isFullWidthViewPath'

describe('isFullWidthViewPath', () => {
    it('should return true if the path is for a full width view', () => {
        const result = isFullWidthViewPath('/app/tickets/123456')
        expect(result).toBe(true)
    })

    it('should return false if the path is for a full width view', () => {
        const result = isFullWidthViewPath('/app/views/123456')
        expect(result).toBe(false)
    })
})
