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

    it('should return the widths as-is if they already fill the total width', () => {
        const result = computeDefaultWidths({
            config: [
                [30, 10, 200],
                [70, 20, 200],
            ],
            totalWidth: 100,
        })

        expect(result).toEqual([30, 70])
    })

    it('should subtract from the panel widths that are still not at their minimum when remaining width is negative', () => {
        const result = computeDefaultWidths({
            config: [
                [70, 10, 200],
                [80, 20, 200],
            ],
            totalWidth: 100,
        })

        expect(result).toEqual([20, 80])
    })
})
