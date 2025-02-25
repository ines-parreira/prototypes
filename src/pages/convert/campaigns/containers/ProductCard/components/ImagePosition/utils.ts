// Set up DnD boundaries and adjust values in order to always keep the image within container
export const getDraggableContainerBounds = (
    imageSize: { width: number; height: number },
    container: { width: number; height: number },
    scale: number,
): { top: number; right: number; bottom: number; left: number } => {
    return {
        left: -1 * (imageSize.width * (scale / 100) - container.width),
        right: 0,
        top: -1 * (imageSize.height * (scale / 100) - container.height),
        bottom: 0,
    }
}
