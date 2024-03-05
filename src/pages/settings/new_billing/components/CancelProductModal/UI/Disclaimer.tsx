import React from 'react'
import CheckBox from 'pages/common/forms/CheckBox'
import css from './Disclaimer.less'

type DisclaimerProps = {
    agreementChecked: boolean
    onChange: (value: boolean) => void
}
const Disclaimer = ({agreementChecked, onChange}: DisclaimerProps) => {
    return (
        <div className={css.container}>
            <div>
                Note that previous charges won't be refunded when you cancel
                unless it is legally required. All amounts shown are in USD.
            </div>
            <div className={css.disclaimerAgreement}>
                <CheckBox
                    className={css.disclaimerCheckbox}
                    isChecked={agreementChecked}
                    onChange={onChange}
                >
                    <span>
                        I agree to the Gorgias{' '}
                        <a
                            href="https://www.gorgias.com/legal/master-subscription-agreement"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Master Subscription Agreement
                        </a>{' '}
                        and{' '}
                        <a
                            href="https://www.gorgias.com/legal/terms-of-use"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Terms
                        </a>
                        . Learn about how we use and protect your data in our{' '}
                        <a
                            href="https://www.gorgias.com/legal/privacy"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Privacy Policy
                        </a>
                        .
                    </span>
                </CheckBox>
            </div>
        </div>
    )
}

export default Disclaimer
