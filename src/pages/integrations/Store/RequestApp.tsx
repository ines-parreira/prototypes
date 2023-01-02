import React from 'react'
import LinkButton from 'pages/common/components/button/LinkButton'

import css from './RequestApp.less'

export default function RequestApp() {
    return (
        <footer className={css.footer}>
            <h4 className={css.title}>Can’t find what you need?</h4>
            <p className={css.incentive}>
                If we are missing an app you were looking for, let us know.
            </p>
            <LinkButton
                href="https://gorgias.productboard.com/insights/notes/"
                target="_blank"
                rel="noopener noreferrer"
            >
                Request App
            </LinkButton>
        </footer>
    )
}
