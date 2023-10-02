import {useState, useRef, useEffect} from 'react'
import {CustomFieldValue} from 'models/customField/types'
import {getStealthLabel} from '../helpers/getLabels'

// Returns a new width for the stealth input and container, based on width of the label, to fit the prediction icon next to it
export const usePredictionIconWidthAdjuster = ({
    value,
    shouldShowIcon,
    isLarge,
}: {
    shouldShowIcon: boolean
    value: CustomFieldValue | undefined
    isLarge: boolean
}) => {
    const LONG_TEXT_MAX_WIDTH = 136
    const SHORT_TEXT_MAX_WIDTH = 82

    const maxWidth = isLarge ? LONG_TEXT_MAX_WIDTH : SHORT_TEXT_MAX_WIDTH
    const [containerWidth, setContainerWidth] = useState(maxWidth)
    const [inputWidth, setInputWidth] = useState(maxWidth)

    const hiddenRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const current = hiddenRef.current
        // Fit prediction icon, trying to resize the input if necessary
        if (current && shouldShowIcon) {
            current.textContent = getStealthLabel(value)
            const newInputWidth = Math.min(current.offsetWidth + 20, maxWidth) // 20px padding
            setInputWidth(newInputWidth)
            setContainerWidth(Math.max(newInputWidth + 17, maxWidth)) //17px icon
        } else {
            setContainerWidth(maxWidth)
            setInputWidth(maxWidth)
        }
    }, [isLarge, shouldShowIcon, maxWidth, value])

    return {
        containerWidth,
        inputWidth,
        hiddenRef,
    }
}
