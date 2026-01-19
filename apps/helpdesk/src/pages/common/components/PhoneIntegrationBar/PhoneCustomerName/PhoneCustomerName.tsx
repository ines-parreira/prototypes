import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import parsePhoneNumber from 'libphonenumber-js'

import { Icon } from '@gorgias/axiom'

import css from './PhoneCustomerName.less'

type Props = {
    name: Maybe<string>
    phoneNumber: string
}

export default function PhoneCustomerName({
    name,
    phoneNumber,
}: Props): JSX.Element {
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
    const formattedPhoneNumber = parsedPhoneNumber?.formatInternational()

    if (!name) {
        return (
            <span className={css.container}>
                {formattedPhoneNumber || phoneNumber}
                {applyCallBarRestyling && <Icon name="arrow-chevron-right" />}
            </span>
        )
    }

    return (
        <span className={css.container}>
            <span className={css.name}>{name}</span> (
            {formattedPhoneNumber || phoneNumber})
            {applyCallBarRestyling && <Icon name="arrow-chevron-right" />}
        </span>
    )
}
