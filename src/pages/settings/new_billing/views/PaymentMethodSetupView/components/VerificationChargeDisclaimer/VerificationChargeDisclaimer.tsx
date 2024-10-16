import React from 'react'
import css from './VerificationChargeDisclaimer.less'

export const VerificationChargeDisclaimer: React.FC = () => (
    <div className={css.disclaimer}>
        <i className="material-icons-outlined">info</i>
        <span>
            <b>A temporary $1 charge</b> will be applied to new payment methods,
            and be <b>refunded within 7 days.</b>
        </span>
    </div>
)
