import React from 'react'

import { assetsUrl } from 'utils'

import css from './NoMatch.less'

export default function NoMatch() {
    return (
        <main className={css.container}>
            <img
                src={assetsUrl('/img/404-error-image.svg')}
                alt="Illustration of a hand holding binoculars shaped like the number 404, indicating a 'Page not found' error."
            />
            <h1 className={css.title}>Page not found</h1>
            <p className="heading-subsection-regular">
                The page you’re looking for couldn’t be found.
            </p>
            <p className="heading-subsection-regular">
                Double check the URL, go back, or try refreshing the page.
            </p>
            <a
                className={`heading-subsection-semibold ${css.button}`}
                href="/app/views"
            >
                <span className="material-icons">inbox</span>
                Go To inbox
            </a>
            <small className="heading-subsection-regular">
                If you think this is a mistake,{' '}
                <a
                    href="https://docs.gorgias.com/en-US/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    contact Support
                </a>
            </small>
        </main>
    )
}
