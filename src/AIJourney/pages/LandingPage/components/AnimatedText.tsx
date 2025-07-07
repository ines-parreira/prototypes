import { motion } from 'framer-motion'

import { splitStringUsingRegex } from 'AIJourney/utils'

import css from './AnimatedText.less'

const text =
    'AI Journey automatically creates and sends personalized SMS messages to shoppers who abandon their cart. No need for templates — Gorgias handles everything, from syncing opted-in subscribers from your platforms to personalizing and delivering each message. \n We know your brand and your shoppers. By combining your existing tone of voice and brand guidelines with the invaluable data we have — including cart contents, pages visited, search history, past orders, and previous conversations — AI Journey crafts impactful, on-brand, and hyper-personalized messages that delight your customers and drive more conversions.'

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
