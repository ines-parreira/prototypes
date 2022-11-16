import React, {createRef, useEffect, useState} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'
import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'

import css from './style.less'

type Props = {
    triggers: CampaignTriggerMap
    onChange: (triggerId: string, value: boolean) => void
}

function getSingleCampaignInViewTrigger(triggers: CampaignTriggerMap) {
    return Object.entries(triggers).find(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([id, trigger]) => trigger.key === CampaignTriggerKey.SingleInView
    )
}

export const CampaignCollisionForm = ({
    triggers = {},
    onChange,
}: Props): JSX.Element => {
    const containerRef = createRef<HTMLDivElement>()
    const [isEnabled, setEnabled] = useState<boolean>(false)

    const handleClickToggle = (nextValue: boolean) => {
        const trigger = getSingleCampaignInViewTrigger(triggers)
        const triggerId = !!trigger ? trigger[0] : ''

        setEnabled(nextValue)
        onChange(triggerId, nextValue)
    }

    useEffect(() => {
        const trigger = getSingleCampaignInViewTrigger(triggers)

        setEnabled(!!trigger)
    }, [triggers, setEnabled])

    return (
        <>
            <div ref={containerRef} className={css.container}>
                <ToggleInput
                    id="single-campaign-in-view-toggle"
                    isToggled={isEnabled}
                    aria-label="Allow campaign to be shown with other campaigns"
                    onClick={handleClickToggle}
                />
                <label
                    htmlFor="single-campaign-in-view-toggle"
                    className={css.label}
                >
                    Show this campaign individually
                    <IconTooltip className={css.helpIcon} icon="help_outline">
                        You can choose to show the campaign individually or
                        stack it with the rest of the displayed campaigns
                    </IconTooltip>
                </label>
            </div>
        </>
    )
}
