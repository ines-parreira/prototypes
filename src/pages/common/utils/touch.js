// @flow
function makeIsDoubleTap({delay=300} = {}) {
    let lastTap: {time: number, target: ?HTMLElement} = {
        time: 0,
        target: null,
    }

    return (element: ?HTMLElement): boolean => {
        const tapTime = Date.now()
        const isDblTap = (
            lastTap.target === element
            && tapTime - lastTap.time < delay
        )
        lastTap.time = tapTime
        lastTap.target = element
        return isDblTap
    }
}

export const isDoubleTap = makeIsDoubleTap()
