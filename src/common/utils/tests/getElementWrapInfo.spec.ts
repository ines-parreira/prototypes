import getElementWrapInfo from '../getElementWrapInfo'

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

        const code = getElementWrapInfo(target.children)

        expect(code).toBeUndefined()
    })

    it('should return the number of elements and the width of visible elements', () => {
        const target = document.createElement('div')
        const child = document.createElement('div')
        const mockLeft = 5
        const mockWidth = 200
        const mockRight = mockLeft + mockWidth
        const mockHeight = 50
        const mockDomRect = {
            width: mockWidth,
            height: mockHeight,
            top: 10,
            left: mockLeft,
            right: mockRight,
            bottom: 10 + mockHeight,
        } as DOMRect

        jest.spyOn(child, 'getBoundingClientRect').mockReturnValue(mockDomRect)
        target.appendChild(child)

        const child2 = document.createElement('div')
        jest.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
            ...mockDomRect,
            top: 70,
            bottom: 70 + mockHeight,
        })
        target.appendChild(child2)

        const code = getElementWrapInfo(target.children)

        expect(code).toMatchObject({
            wrappedElementCount: 1,
            width: mockRight - mockLeft,
        })
    })
})
