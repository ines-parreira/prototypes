import { useCallback } from 'react'

import { FieldPresentation, Switch } from 'AIJourney/components'
import { JOURNEY_TYPES } from 'AIJourney/constants'

import css from './EnableImage.less'

interface EnableImageFieldProps {
    isEnabled?: boolean
    journeyType: JOURNEY_TYPES
    onChange?: () => void
}

export const EnableImageField = ({
    isEnabled = false,
    journeyType,
    onChange,
}: EnableImageFieldProps) => {
    const handleChange = useCallback(() => {
        onChange?.()
    }, [onChange])

    const fieldDescription: Partial<Record<JOURNEY_TYPES, string>> = {
        [JOURNEY_TYPES.CART_ABANDONMENT]:
            'Show the shopper an image of the items left in their cart in the first message.',
        [JOURNEY_TYPES.SESSION_ABANDONMENT]:
            'Show the shopper an image of the product from their last visited page.',
        [JOURNEY_TYPES.WIN_BACK]:
            'Show the shopper an image of the featured product in the first message.',
    }

    return (
        <div className={css.enableImageField}>
            <FieldPresentation
                name="Send image"
                description={fieldDescription[journeyType]}
            />
            <Switch isChecked={isEnabled} onChange={handleChange} />
        </div>
    )
}
