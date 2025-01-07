import {waitForDocumentVisible} from '../waitForDocumentVisible'

function setDocumentHidden(hidden: boolean): void {
    Object.defineProperty(document, 'hidden', {
        value: hidden,
        configurable: true,
    })
}

describe('waitForDocumentVisible', () => {
    afterAll(() => {
        setDocumentHidden(false)
    })

    it('immediately returns if the document is visible', async () => {
        setDocumentHidden(false)

        const promise = waitForDocumentVisible()
        await expect(promise).resolves.toBeUndefined()
    })

    it('waits for visibility change and cleans after itself if the document is hidden', async () => {
        jest.spyOn(document, 'addEventListener')
        jest.spyOn(document, 'removeEventListener')

        setDocumentHidden(true)

        const promise = waitForDocumentVisible()
        expect(document.addEventListener).toHaveBeenCalled()
        expect(document.removeEventListener).not.toHaveBeenCalled()

        document.dispatchEvent(new Event('visibilitychange'))
        expect(document.removeEventListener).not.toHaveBeenCalled()

        setDocumentHidden(false)
        document.dispatchEvent(new Event('visibilitychange'))

        await expect(promise).resolves.toBeUndefined()
        expect(document.removeEventListener).toHaveBeenCalled()
    })
})
