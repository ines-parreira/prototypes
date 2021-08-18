import React from 'react'
import {FormFeedback, FormGroup, Input} from 'reactstrap'
import isUrl from 'validator/lib/isURL'

import {LinkEntity} from '../LinkList'

import css from './SocialNavigationLinks.less'

type Props = LinkEntity & {
    logo: string
    onBlur: (
        ev: React.FocusEvent<HTMLInputElement>,
        key: 'value',
        id: number
    ) => void
}

export const SocialNavigationItem = ({
    id,
    label,
    value,
    logo,
    onBlur,
}: Props): JSX.Element => {
    const errMessage = value !== '' && !isUrl(value) ? 'URL is invalid' : ''
    const [innerValue, setInnerValue] = React.useState(value)

    React.useEffect(() => {
        setInnerValue(value)
    }, [value])

    const handleOnChangeValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setInnerValue(ev.target.value)
    }

    return (
        <div className={css['social-item']} data-testid={`${label}-nav`}>
            <div className={css.label}>
                <img src={logo} alt={label} className={css.logo} />
                <span data-testid={`${label}-label`}>{label}</span>
            </div>
            <div>
                <FormGroup>
                    <Input
                        className={css['social-input']}
                        value={innerValue}
                        invalid={!!errMessage}
                        onChange={handleOnChangeValue}
                        onBlur={(ev) => {
                            ev.persist()
                            onBlur(ev, 'value', id)
                        }}
                    />
                    {!!errMessage && <FormFeedback>{errMessage}</FormFeedback>}
                </FormGroup>
            </div>
        </div>
    )
}
