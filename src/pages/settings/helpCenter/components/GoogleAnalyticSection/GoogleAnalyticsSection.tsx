import React, {useState} from 'react'
import classNames from 'classnames'
import settingsCss from 'pages/settings/settings.less'
import InputField from '../../../../common/forms/input/InputField'

import css from './GoogleAnalyticsSection.less'
import {isValidGaid} from './utils'

type Props = {
    gaid: string
    onChange: (value: string) => void
    onDelete: null | (() => void)
}

export const GoogleAnalyticsSection = ({onChange, onDelete, gaid}: Props) => {
    const [error, setError] = useState('')

    const handleChange = (nextValue: string) => {
        const upperCased = nextValue.toUpperCase()
        if (upperCased && !isValidGaid(upperCased)) {
            setError('Invalid Google analytics ID value')
        } else {
            setError('')
        }
        onChange(upperCased)
    }

    return (
        <section className={settingsCss.mb40}>
            <h4>Google Analytics</h4>
            <p>
                Provide your <b>Google Universal Analytics ID</b> or{' '}
                <b>Google Analytics 4 property ID</b> such as{' '}
                <i>UA-123456789-1</i> or <i>G-ABCD1234E</i>.{' '}
                <a href="https://docs.gorgias.com/en-US/how-to-use-google-analytics-with-your-help-center-97353">
                    Learn more
                </a>{' '}
                about how to use Google Analytics with your help center.
            </p>
            <div className={css.gaInput}>
                <InputField
                    name="gaid-input"
                    placeholder="Ex: UA-123456789-1 or G-ABCD1234E"
                    value={gaid}
                    onChange={handleChange}
                    isDisabled={!!onDelete}
                    error={error}
                />
                {onDelete ? (
                    <span
                        data-testid="delete-ga-btn"
                        onClick={onDelete}
                        className={classNames(css.deleteGa, 'material-icons')}
                    >
                        delete
                    </span>
                ) : null}
            </div>
        </section>
    )
}

export default GoogleAnalyticsSection
