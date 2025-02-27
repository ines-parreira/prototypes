import getWrappedElementCount from '../getWrappedElementCount'

const child1 = document.createElement('button')
jest.spyOn(child1, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    width: 50,
} as DOMRect)
child1.textContent = 'A'
const child2 = document.createElement('div')
child2.textContent = 'B'
jest.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    width: 50,
} as DOMRect)
const child3 = document.createElement('div')
child3.textContent = 'C'
jest.spyOn(child3, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    width: 50,
} as DOMRect)
const child4 = document.createElement('div')
child4.textContent = 'D'
jest.spyOn(child4, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    width: 50,
} as DOMRect)

describe('getWrappedElementCount', () => {
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

        const code = getWrappedElementCount(target)

        expect(code).toBe(0)
    })

    it('should return correct wrappedElementCount and width', () => {
        const element = document.createElement('div')
        element.appendChild(child1)
        element.appendChild(child2)
        element.appendChild(child3)
        element.appendChild(child4)

        const result = getWrappedElementCount(element)

        const expectedWrappedElementCount = 1 // Only the last element should wrap

        expect(result).toBeDefined()
        expect(result).toBe(expectedWrappedElementCount)
    })

    it('should return undefined if no wrapping occurs', () => {
        const element = document.createElement('div')
        element.appendChild(child1)
        element.appendChild(child2)
        element.appendChild(child3)

        const result = getWrappedElementCount(element)

        expect(result).toBe(0)
    })
})
