import React, {useMemo, useRef, useState} from 'react'

import _reduce from 'lodash/reduce'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'

import {TriggerConfigValue} from 'pages/convert/campaigns/types/TriggerConfig'
import {useAvailableTriggerList} from '../../hooks/useAvailableTriggerList'
import {useIsHeadlessShopifyStore} from '../../hooks/useIsHeadlessShopifyStore'

import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'
import css from './AdvancedTriggersSelect.less'

type Props = {
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    onClick: (value: CampaignTriggerType) => void
}

export const AdvancedTriggersSelect = ({
    isConvertSubscriber = false,
    isShopifyStore = false,
    onClick,
}: Props): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const isShopifyHeadless = useIsHeadlessShopifyStore()

    const handleClickItem = (value: CampaignTriggerType) => {
        setIsOpen(false)
        onClick(value)
    }

    const options = useAvailableTriggerList({
        isConvertSubscriber,
        isShopifyStore,
        isShopifyHeadless,
    })

    const optionsGrouped = useMemo(
        () =>
            _reduce(
                options,
                (acc, value, key) => {
                    const group = value.group
                    if (group) {
                        if (!acc[group]) acc[group] = []
                        acc[group].push({
                            ...value,
                            key: key as CampaignTriggerType,
                        })
                    }
                    return acc
                },
                {} as Record<
                    string,
                    (TriggerConfigValue & {key: CampaignTriggerType})[]
                >
            ),
        [options]
    )

    return (
        <>
            <Button
                intent="secondary"
                name="add condition"
                data-testid="btn:add-condition"
                role="button"
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="material-icons mr-2" style={{fontSize: 16}}>
                    add
                </i>
                Add condition
                <i className="material-icons ml-2" style={{fontSize: 20}}>
                    arrow_drop_down
                </i>
            </Button>
            <Dropdown isOpen={isOpen} onToggle={setIsOpen} target={buttonRef}>
                <DropdownBody>
                    {Object.entries(optionsGrouped).map(
                        ([key, group], index) => (
                            <DropdownSection
                                className={
                                    index === 0 ? css.firstSection : undefined
                                }
                                title={key}
                                key={key}
                            >
                                {group.map((option) => (
                                    <DropdownItem
                                        key={option.key}
                                        option={{
                                            label: option.label,
                                            value: option.key,
                                        }}
                                        onClick={handleClickItem}
                                    />
                                ))}
                            </DropdownSection>
                        )
                    )}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
