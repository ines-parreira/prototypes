import computeDefaultWidths from '../computeDefaultWidths'

describe('computeDefaultWidths', () => {
    it('should clamp widths that exceed min/max constraints', () => {
        const result = computeDefaultWidths({
            config: [
                [200, 100, 150],
                [300, 400, 500],
            ],
            totalWidth: 1000,
        })

        expect(result).toEqual([150, 400])
    })

    it('should respect the maximum width even if the total width is not filled', () => {
        const result = computeDefaultWidths({
            config: [
                [200, 150, 250],
                [Infinity, 100, 250],
            ],
            totalWidth: 1000,
        })

        expect(result).toEqual([200, 250])
    })

    it('should respect the minimum width even if the panels will exceed the total width', () => {
        const result = computeDefaultWidths({
            config: [
                [200, 150, 200],
                [Infinity, 200, 300],
            ],
            totalWidth: 300,
        })

        expect(result).toEqual([200, 200])
    })

    it('should divide remaining width equally', () => {
        const result = computeDefaultWidths({
            config: [[200, 150, 200], [Infinity], [Infinity]],
            totalWidth: 1000,
        })

        expect(result).toEqual([200, 400, 400])
    })

    it('should respect minimum widths when dividing up the remaining width', () => {
        const result = computeDefaultWidths({
            config: [[200, 150, 200], [Infinity], [Infinity, 500]],
            totalWidth: 1000,
        })

        expect(result).toEqual([200, 150, 650])
    })
})
