import React, {createRef, useState, useMemo} from 'react'
import _intersection from 'lodash/intersection'
import cn from 'classnames'

import useUpdateEffect from 'hooks/useUpdateEffect'

import ToggleInput from 'pages/common/forms/ToggleInput'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {CONVERT_SHOPIFY_TRIGGERS} from 'pages/convert/campaigns/constants/triggers'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerMap} from 'pages/convert/campaigns/types/CampaignTriggerMap'

import css from './CampaignIncognitoVisitorsSwitch.less'

type Props = {
    triggers: CampaignTriggerMap
    onChange: (triggerId: string, value: boolean | undefined) => void
}

const getIncognitoTriggerId = (triggers: CampaignTriggerMap): string => {
    const trigger = getIncognitoVisitorTrigger(triggers)
    return !!trigger ? trigger[0] : ''
}

const getIncognitoVisitorTrigger = (triggers: CampaignTriggerMap) => {
    return Object.entries(triggers).find(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([id, trigger]) => trigger.type === CampaignTriggerType.IncognitoVisitor
    )
}

const shouldIncognitoTriggerBeDisabled = (
    triggers: CampaignTriggerMap
): boolean => {
    const evaluation = Object.values(triggers)
        .filter((trigger) => {
            return CONVERT_SHOPIFY_TRIGGERS.includes(trigger.type)
        })
        .map((trigger) => {
            switch (trigger.type) {
                case CampaignTriggerType.AmountSpent:
                case CampaignTriggerType.OrdersCount:
                    return (
                        trigger.value &&
                        parseInt(trigger.value as unknown as string) !== 0
                    )
                case CampaignTriggerType.CustomerTags:
                case CampaignTriggerType.OrderedProducts:
                    if (Array.isArray(trigger.value)) {
                        return trigger.value.length > 0
                    }

                    return Boolean(trigger.value)
            }
        })

    return evaluation.some(Boolean)
}

const CampaignIncognitoVisitorsSwitch: React.FC<Props> = ({
    triggers,
    onChange,
}) => {
    const containerRef = createRef<HTMLDivElement>()

    const hasShopifyTrigger = useMemo(() => {
        const triggerTypes = Object.values(triggers).map((trigger) => {
            return trigger.type
        })
        return (
            _intersection(CONVERT_SHOPIFY_TRIGGERS, triggerTypes).length !== 0
        )
    }, [triggers])

    const shouldBeDisabled = useMemo(() => {
        return shouldIncognitoTriggerBeDisabled(triggers)
    }, [triggers])

    const incognitoVisitorTrigger = useMemo<boolean | undefined>(() => {
        const trigger = getIncognitoVisitorTrigger(triggers)
        if (!trigger) {
            return undefined
        }
        return JSON.parse(trigger[1].value as string) as boolean
    }, [triggers])

    // set initial values for the states
    const [isEnabled, setIsEnabled] = useState<boolean>(
        incognitoVisitorTrigger === undefined
            ? hasShopifyTrigger
                ? !shouldBeDisabled
                : false
            : incognitoVisitorTrigger
    )
    const [isForcedByUser, setIsForcedByUser] = useState<boolean>(false)

    const handleClickToggle = (nextValue: boolean) => {
        setIsForcedByUser(true)
        setIsEnabled(nextValue)
    }

    useUpdateEffect(() => {
        if (isForcedByUser || !hasShopifyTrigger) {
            if (!hasShopifyTrigger) {
                // Remove incognito trigger if we don't have "shopify" triggers
                const triggerId = getIncognitoTriggerId(triggers)
                onChange(triggerId, undefined)
                setIsEnabled(false)
            }
            return
        }
        setIsEnabled(!shouldBeDisabled)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggers])

    useUpdateEffect(() => {
        if (!hasShopifyTrigger) {
            return
        }

        const triggerId = getIncognitoTriggerId(triggers)
        onChange(triggerId, isEnabled)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])

    return (
        <>
            <div
                ref={containerRef}
                className={cn(css.container, {
                    [css.disabled]: !hasShopifyTrigger,
                })}
            >
                <ToggleInput
                    id="incognito-visitors-toggle"
                    isToggled={isEnabled}
                    isDisabled={!hasShopifyTrigger}
                    onClick={handleClickToggle}
                />
                <label
                    htmlFor="incognito-visitors-toggle"
                    className={css.label}
                >
                    Incognito visitors will also see the campaign
                    <IconTooltip className={css.helpIcon} icon="help_outline">
                        When a visitor is not matched with an existing Shopify
                        customer profile (because they are not logged in or
                        because they don’t have a Shopify profile in this
                        store), the campaign will be displayed. For campaigns
                        containing a customer-based trigger only.
                    </IconTooltip>
                </label>
            </div>
        </>
    )
}

export default CampaignIncognitoVisitorsSwitch
