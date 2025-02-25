import React from 'react'

import CheckBox from 'pages/common/forms/CheckBox'

import css from './Disclaimer.less'

type DisclaimerProps = {
    agreementChecked: boolean
    onChange: (value: boolean) => void
}
const Disclaimer = ({ agreementChecked, onChange }: DisclaimerProps) => {
    return (
        <div className={css.container}>
            <div className={css.disclaimerAgreement}>
                <CheckBox
                    className={css.disclaimerCheckbox}
                    isChecked={agreementChecked}
                    onChange={onChange}
                >
                    <span>
                        Gorgias is not required to issue you a refund when
                        cancelling Services (as provided in our{' '}
                        <a
                            href="https://www.gorgias.com/legal/master-subscription-agreement"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Agreement
                        </a>
                        ). Additionally, if you cancel your Subscription, you
                        are required to pay any fees and/or overages incurred
                        before your cancellation takes effect.
                    </span>
                </CheckBox>
            </div>
        </div>
    )
}

export default Disclaimer
