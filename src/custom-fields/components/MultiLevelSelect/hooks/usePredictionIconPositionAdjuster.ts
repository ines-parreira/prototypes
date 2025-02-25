import { useEffect, useRef, useState } from 'react'

import { CustomFieldValue } from 'custom-fields/types'

import { getStealthLabel } from '../helpers/getLabels'

const ICON_WIDTH = 17
const SPACE = 6

// Returns the x-axis position of the prediction icon based on the approximated width of the value, to fit the icon next to it
export const usePredictionIconPositionAdjuster = ({
    value,
    inputDimensions,
    shouldShowIcon,
}: {
    shouldShowIcon: boolean
    inputDimensions: DOMRect | null
    value: CustomFieldValue | undefined
}) => {
    const [iconLeft, setIconLeft] = useState(0)
    const hiddenRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const current = hiddenRef.current
        if (current && shouldShowIcon) {
            current.textContent = getStealthLabel(value)
            const inputWidth = inputDimensions?.width ?? 0
            // if dummy element containing value is too close to the limit,
            // take the input width as reference
            const xPosition =
                Math.abs(inputWidth - current.offsetWidth) < 20
                    ? inputWidth - ICON_WIDTH
                    : current.offsetWidth + SPACE

            setIconLeft(xPosition)
        }
    }, [inputDimensions, shouldShowIcon, value])

    return {
        iconLeft,
        hiddenRef,
    }
}
