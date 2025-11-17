import { useEffect, useState } from 'react'
import type { ChangeEvent, FocusEvent } from 'react'

import { FormFeedback, FormGroup, Input } from 'reactstrap'
import isUrl from 'validator/lib/isURL'

import type { LinkEntity } from 'pages/settings/helpCenter/components/LinkList'
import { isURLOptions } from 'pages/settings/helpCenter/utils/navigationLinks'

import css from './SocialNavigationLinks.less'

type Props = LinkEntity & {
    logo: string
    onBlur: (ev: FocusEvent<HTMLInputElement>, key: 'value', id: number) => void
}

export const SocialNavigationItem = ({
    id,
    label,
    value,
    logo,
    onBlur,
}: Props): JSX.Element => {
    const errMessage =
        value !== '' && !isUrl(value, isURLOptions) ? 'URL is invalid' : ''
    const [innerValue, setInnerValue] = useState(value)

    useEffect(() => {
        setInnerValue(value)
    }, [value])

    const handleOnChangeValue = (ev: ChangeEvent<HTMLInputElement>) => {
        setInnerValue(ev.target.value)
    }

    return (
        <div className={css['social-item']} data-testid={`${label}-nav`}>
            <div className={css.label}>
                <div className={css['logo-wrapper']}>
                    <div
                        className={css.logo}
                        style={{
                            WebkitMaskImage: `url(${logo})`,
                            maskImage: `url(${logo})`,
                        }}
                    />
                </div>
                <span data-testid={`${label}-label`}>{label}</span>
            </div>
            <div>
                <FormGroup className={css.formGroup}>
                    <Input
                        className={css['social-input']}
                        value={innerValue}
                        placeholder={`${label} page link`}
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
