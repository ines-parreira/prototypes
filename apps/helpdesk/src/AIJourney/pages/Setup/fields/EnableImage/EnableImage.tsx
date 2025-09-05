import { useCallback } from 'react'

import { FieldPresentation, Switch } from 'AIJourney/components'

import css from './EnableImage.less'

interface EnableImageFieldProps {
    isEnabled?: boolean
    onChange?: () => void
}

export const EnableImageField = ({
    isEnabled = false,
    onChange,
}: EnableImageFieldProps = {}) => {
    const handleChange = useCallback(() => {
        onChange?.()
    }, [onChange])

    return (
        <div className={css.enableImageField}>
            <FieldPresentation
                name="Include an image"
                description="Send an image in the first message"
            />
            <Switch isChecked={isEnabled} onChange={handleChange} />
        </div>
    )
}
