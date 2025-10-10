import { vi } from 'vitest'

export const mockRequestAnimationFrame = (getFrameId = () => Infinity) => {
    let callbacks: FrameRequestCallback[] = []
    return {
        spy: vi
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((callback: FrameRequestCallback) => {
                callbacks.push(callback)
                return getFrameId()
            }),
        run: () => {
            callbacks.forEach((callback) => callback(performance.now()))
            callbacks = []
        },
        clear: () => {
            callbacks = []
        },
    }
}
