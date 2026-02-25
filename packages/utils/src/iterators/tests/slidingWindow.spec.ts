import { slidingWindow } from '../slidingWindow'

describe('slidingWindow', () => {
    it('should yield nothing for an empty array', () => {
        const result = [...slidingWindow([])]

        expect(result).toEqual([])
    })

    it('should yield undefined as previous for the first element', () => {
        const result = [...slidingWindow([1, 2, 3])]

        expect(result).toEqual([
            [1, undefined],
            [2, 1],
            [3, 2],
        ])
    })

    it('should work with a single element', () => {
        const result = [...slidingWindow(['a'])]

        expect(result).toEqual([['a', undefined]])
    })

    it('should be usable in a for-of loop to group consecutive elements', () => {
        const numbers = [1, 2, 3, 10, 11, 20]
        const groups: number[][] = []

        for (const [current, previous] of slidingWindow(numbers)) {
            if (previous !== undefined && current - previous <= 2) {
                groups[groups.length - 1].push(current)
            } else {
                groups.push([current])
            }
        }

        expect(groups).toEqual([[1, 2, 3], [10, 11], [20]])
    })

    it('should be lazily evaluated', () => {
        const items = [1, 2, 3, 4, 5]
        const yielded: number[] = []

        for (const [current] of slidingWindow(items)) {
            yielded.push(current)
            if (current === 3) break
        }

        expect(yielded).toEqual([1, 2, 3])
    })
})
