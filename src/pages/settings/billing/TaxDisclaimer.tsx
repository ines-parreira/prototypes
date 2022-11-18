import React from 'react'
import classnames from 'classnames'

import css from './TaxDisclaimer.less'

type Props = {
    className?: string
}

const TaxDisclaimer = ({className}: Props) => (
    <div className={classnames(css.wrapper, className)}>
        * Prices do not include{' '}
        <a
            href="https://www.gorgias.com/pricing/billing-sales-tax"
            target="_blank"
            rel="noopener noreferrer"
        >
            sales tax
        </a>
    </div>
)

export default TaxDisclaimer
