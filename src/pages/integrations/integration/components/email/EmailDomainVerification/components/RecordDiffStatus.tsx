import React from 'react'

import { EmailDNSRecord } from '@gorgias/api-queries'
import { Badge, Tooltip } from '@gorgias/merchant-ui-kit'

import CharDiff from './CharDiff'

import css from './EmailDomainVerificationDiffStatus.less'

const MISMATCH_TOOLTIP_SINGLE_VALUE =
    "The value you entered doesn't match the record. Copy and paste the value into your DNS settings to avoid errors."
const MISMATCH_TOOLTIP_MULTIPLE_VALUES =
    'Detected multiple values. Add the correct value as a single DNS record.'
const MAX_CHARS = 250

type Props = {
    record: EmailDNSRecord
}

export default function RecordDiffStatus({ record }: Props) {
    const {
        verified,
        current_values: currentValues,
        value: requiredValue,
    } = record

    const currentValue = currentValues ? currentValues.join(',\n') : ''
    const truncatedCurrentValue = currentValue.slice(0, MAX_CHARS)

    if (verified) {
        return <Badge type={'success'}>Verified</Badge>
    }

    if (!currentValue) {
        return <Badge type={'light-dark'}>Missing value</Badge>
    }

    return (
        <div className={css.container}>
            <Badge type={'light-error'}>
                Mismatch{' '}
                <>
                    <i id="mismatch-icon" className="material-icons">
                        error_outline
                    </i>
                    <Tooltip target={'mismatch-icon'}>
                        {currentValues && currentValues.length > 1
                            ? MISMATCH_TOOLTIP_MULTIPLE_VALUES
                            : MISMATCH_TOOLTIP_SINGLE_VALUE}
                    </Tooltip>
                </>
            </Badge>
            <div>
                <CharDiff
                    string1={requiredValue}
                    string2={truncatedCurrentValue}
                />
                {currentValue.length > MAX_CHARS && <span>...</span>}
            </div>
        </div>
    )
}
