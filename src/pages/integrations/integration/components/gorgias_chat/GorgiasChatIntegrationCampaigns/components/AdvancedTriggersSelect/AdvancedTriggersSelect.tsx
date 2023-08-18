import React, {useMemo, useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'

import {useAvailableTriggerList} from '../../hooks/useAvailableTriggerList'
import {useIsHeadlessShopifyStore} from '../../hooks/useIsHeadlessShopifyStore'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import css from './AdvancedTriggersSelect.less'

type Props = {
    isRevenueBetaTester?: boolean
    isShopifyStore?: boolean
    onClick: (value: CampaignTriggerKey) => void
}

export const AdvancedTriggersSelect = ({
    isRevenueBetaTester = false,
    isShopifyStore = false,
    onClick,
}: Props): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const isShopifyHeadless = useIsHeadlessShopifyStore()

    const handleClickItem = (value: CampaignTriggerKey) => {
        setIsOpen(false)
        onClick(value)
    }

    const options = useAvailableTriggerList({
        isRevenueBetaTester,
        isShopifyStore,
        isShopifyHeadless,
    })

    const optionsGrouped = useMemo(() => {
        return options.reduce((acc, option) => {
            if (option.group) {
                acc[option.group] = [...(acc[option.group] || []), option]
            }
            return acc
        }, {} as Record<string, typeof options>)
    }, [options])

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
