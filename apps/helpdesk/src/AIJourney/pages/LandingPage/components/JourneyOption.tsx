import { motion } from 'framer-motion'

import { FieldPresentation } from 'AIJourney/components'

import css from './JourneyOption.less'

type JourneyOptionProps = {
    description?: string
    name: string
    onChange: (value: string) => void
    selected: boolean
    value: string
}

export const JourneyOption = ({
    description,
    name,
    onChange,
    selected,
    value,
}: JourneyOptionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className={css.infoText}
        >
            <div className={css.onboardingJourneyOption}>
                <div className={css.headerInfo}>
                    <input
                        type="radio"
                        name="journey-option"
                        value={value}
                        checked={selected}
                        onChange={() => onChange(value)}
                    />
                    <FieldPresentation name={name} description={description} />
                </div>
            </div>
        </motion.div>
    )
}
