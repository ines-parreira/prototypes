import getElementWrapInfo from '../getElementWrapInfo'

const baseChildren = [
    {
        tagName: 'BUTTON',
        textContent: 'A',
        getBoundingClientRect: jest.fn(() => ({
            width: 50,
            top: 0,
        })),
    },
    {
        tagName: 'DIV',
        textContent: 'A',
        getBoundingClientRect: jest.fn(() => ({
            width: 50,
            top: 0,
        })),
    },
    {
        tagName: 'DIV',
        textContent: 'B',
        getBoundingClientRect: jest.fn(() => ({
            width: 50,
            top: 0,
        })),
    },
] as unknown as HTMLCollection

describe('getElementWrapInfo', () => {
    it('should return undefined when there is no wrapped elements', () => {
        const target = document.createElement('div')
        const child = document.createElement('div')

        jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
            top: 10,
        } as DOMRect)
        target.appendChild(child)

        const child2 = document.createElement('div')
        jest.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
            top: 10,
        } as DOMRect)
        target.appendChild(child2)

        const code = getElementWrapInfo(target.children, 500)

        expect(code).toBe(0)
    })

    it('should return correct wrappedElementCount and width', () => {
        // Mock HTMLCollection
        const mockChildren = [
            ...baseChildren,
            {
                tagName: 'DIV',
                textContent: 'C',
                getBoundingClientRect: jest.fn(() => ({
                    width: 50,
                    top: 10,
                })),
            },
        ] as unknown as HTMLCollection

        const mockTotalWidth = 150

        const result = getElementWrapInfo(mockChildren, mockTotalWidth)

        const expectedWrappedElementCount = 1 // Only the last element should wrap

        expect(result).toBeDefined()
        expect(result).toBe(expectedWrappedElementCount)
    })

    it('should return undefined if no wrapping occurs', () => {
        const mockTotalWidth = 200

        const result = getElementWrapInfo(baseChildren, mockTotalWidth)

        expect(result).toBe(0)
    })
})
