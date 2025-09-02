import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { Button, FieldPresentation } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'

import css from './Test.less'

export const Test = () => {
    const history = useHistory()
    const { shopName } = useJourneyContext()

    return (
        <motion.div
            className={css.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <FieldPresentation
                name="Test page"
                description="AI Journey playground"
            />
            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={`/app/ai-journey/${shopName}/setup`}
                    label="Return"
                />
                <Button
                    label="Continue"
                    onClick={() => {
                        history.push(`/app/ai-journey/${shopName}/activate`)
                    }}
                    isDisabled={false}
                />
            </div>
        </motion.div>
    )
}
