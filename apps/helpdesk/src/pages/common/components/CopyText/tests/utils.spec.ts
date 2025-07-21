import { selectText } from '../utils'

describe('selectText', () => {
    const mockRange = {
        selectNodeContents: jest.fn(),
    }
    const mockSelection = {
        removeAllRanges: jest.fn(),
        addRange: jest.fn(),
        toString: jest.fn(),
    }

    beforeAll(() => {
        // Mock necessary DOM methods and objects
        jest.spyOn(document, 'getElementById').mockReturnValue(
            document.createElement('div'),
        )
        jest.spyOn(document, 'createRange').mockReturnValue(mockRange as any)
        jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any)
    })

    afterAll(() => {
        // Restore the original methods and objects after testing
        ;(document.getElementById as jest.Mock).mockRestore()
        ;(document.createRange as jest.Mock).mockRestore()
        ;(window.getSelection as jest.Mock).mockRestore()
    })

    it('should select text within an element', () => {
        // Call the selectText function
        selectText('testElement')

        // Check if the text is selected
        expect(mockRange.selectNodeContents).toHaveBeenCalledWith(
            expect.any(HTMLDivElement),
        )
        expect(mockSelection.removeAllRanges).toHaveBeenCalled()
        expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange)
    })
})
