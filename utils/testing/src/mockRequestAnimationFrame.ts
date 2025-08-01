export const mockRequestAnimationFrame = (getFrameId = () => Infinity) => {
    let callbacks: FrameRequestCallback[] = []
    return {
        spy: jest
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((callback) => {
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
