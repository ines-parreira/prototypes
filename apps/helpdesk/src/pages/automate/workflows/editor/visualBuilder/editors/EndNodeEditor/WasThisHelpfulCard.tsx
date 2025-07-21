import Button from 'pages/common/components/button/Button'

import css from './WasThisHelpfulCard.less'

export default function WasThisHelpfulCard() {
    return (
        <div className={css.container}>
            <div className={css.question}>Was this helpful?</div>
            <div className={css.choicesContainer}>
                <Button intent="secondary" className={css.button} size="small">
                    Yes, thank you
                </Button>
                <Button intent="secondary" className={css.button} size="small">
                    No, I need more help
                </Button>
            </div>
        </div>
    )
}
