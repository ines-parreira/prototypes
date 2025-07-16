import { motion } from 'framer-motion'

import { splitStringUsingRegex } from 'AIJourney/utils'

import css from './AnimatedText.less'

const text =
    "Gorgias' new AI Journey will help you automatically craft impactful, on-brand and hyper personalized SMS to delight your customers and drive up your conversion rates."

const charVariants = {
    hidden: { opacity: 0 },
    reveal: { opacity: 1 },
}

export const AnimatedText = () => {
    const textChars = splitStringUsingRegex(text)

    return (
        <motion.div
            className={css.content}
            initial="hidden"
            whileInView="reveal"
            transition={{ staggerChildren: 0.001 }}
        >
            {textChars.map((char, index) =>
                char === '\n' ? (
                    <br key={index} />
                ) : (
                    <motion.span
                        key={index}
                        transition={{ duration: 0.5 }}
                        variants={charVariants}
                        style={{ display: 'inline' }}
                    >
                        {char}
                    </motion.span>
                ),
            )}
        </motion.div>
    )
}
