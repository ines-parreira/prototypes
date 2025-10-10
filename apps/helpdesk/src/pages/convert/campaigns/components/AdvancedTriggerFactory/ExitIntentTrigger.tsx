import { LegacyButton as Button } from '@gorgias/axiom'

import css from './style.less'

export const ExitIntentTrigger = (): JSX.Element => {
    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="Exit intent"
                    className="btn-frozen"
                >
                    Exit intent
                </Button>
            </div>
            <div className={css.fixedOperator}>is detected</div>
        </>
    )
}
