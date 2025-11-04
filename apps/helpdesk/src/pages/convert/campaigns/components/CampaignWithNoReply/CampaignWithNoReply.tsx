import { useEffect, useState } from 'react'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import css from './CampaignWithNoReply.less'

type Props = {
    value: boolean
    onChange: (value: boolean) => void
}

export const CampaignWithNoReply = ({
    value,
    onChange,
}: Props): JSX.Element => {
    const [isEnabled, setEnabled] = useState<boolean>(value)

    const handleClickToggle = (nextValue: boolean) => {
        setEnabled(!nextValue)
        onChange(!nextValue)
    }

    useEffect(() => {
        if (value !== isEnabled) {
            setEnabled(value)
        }
    }, [isEnabled, value, setEnabled])

    return (
        <>
            <div className={css.container}>
                <ToggleField
                    id="campaign-with-no-reply"
                    value={!isEnabled}
                    aria-label="Customers can reply to this campaign"
                    onChange={handleClickToggle}
                />
                <label htmlFor="campaign-with-no-reply" className={css.label}>
                    Customers can reply to this campaign
                </label>
            </div>
        </>
    )
}
