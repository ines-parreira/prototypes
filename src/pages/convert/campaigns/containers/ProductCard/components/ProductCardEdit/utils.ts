// Adjust the minimum zoom limit in order to always keep the image within the container
export const getMinRangeSize = (
    image: {width: number; height: number},
    container: {width: number; height: number}
): number => {
    if (!image?.width || !image?.height) return 1

    return Math.ceil(
        100 /
            Math.min(
                image.width / container.width,
                image.height / container.height
            )
    )
}

// Convert the size value to the input range value based on a linear transformation from a point
// within [minRangeSize - 100] scale to [1 - 100] scale
export const convertSizeToRangeValue = (
    size: number,
    minRangeSize: number
): number => {
    const converted =
        1 + ((100 - 1) * (size - minRangeSize)) / (100 - minRangeSize)

    return Number(converted.toFixed(3))
}

// Convert the input range value to the input value based on a linear transformation from a point
// within [1 - 100] scale to [minRangeSize - 100] scale
export const convertRangeValueToSize = (
    value: number,
    minRangeSize: number
): number => {
    const converted =
        minRangeSize + ((value - 1) * (100 - minRangeSize)) / (100 - 1)

    return Number(converted.toFixed(3))
}
