import React from 'react'

import css from './EmailIntegrationOnboardingButtons.less'

type Props = {
    children: React.ReactNode
}

export default function EmailIntegrationOnboardingButtons({children}: Props) {
    return <div className={css.buttons}>{children}</div>
}
