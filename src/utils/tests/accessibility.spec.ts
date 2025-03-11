import { handleButtonLikeClick } from 'utils/accessibility'

describe('handleButtonLikeClick', () => {
    it('should return an object with correct properties / values', () => {
        const callback = jest.fn()
        const result = handleButtonLikeClick(callback)
        expect(result.tabIndex).toBe(0)
        expect(result.role).toBe('button')
        expect(result.onClick).toBeDefined()
        expect(result.onKeyDown).toBeDefined()
    })

    it("should call the callback function when the 'onClick' function is called", () => {
        const callback = jest.fn()
        const result = handleButtonLikeClick(callback)
        result.onClick({} as unknown as React.MouseEvent<HTMLElement>)
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith({})
    })

    it("should call the callback function when the 'onKeyDown' function is called with 'Enter' or 'Space'", () => {
        const callback = jest.fn()
        const result = handleButtonLikeClick(callback)
        result.onKeyDown({
            code: 'Enter',
        } as unknown as React.KeyboardEvent<HTMLElement>)
        expect(callback).toHaveBeenCalledTimes(1)
        result.onKeyDown({
            code: 'Space',
        } as unknown as React.KeyboardEvent<HTMLElement>)
        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenCalledWith({ code: 'Space' })
    })
})
