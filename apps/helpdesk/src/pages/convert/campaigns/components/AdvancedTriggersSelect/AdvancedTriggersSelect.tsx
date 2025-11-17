import React, { useMemo, useRef, useState } from 'react'

import { useIsHeadlessShopifyStore } from '../../hooks/useIsHeadlessShopifyStore'
import _reduce from 'lodash/reduce'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import type { TriggerConfigValue } from 'pages/convert/campaigns/types/TriggerConfig'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal'

import { useAvailableTriggerList } from '../../hooks/useAvailableTriggerList'
import type { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'

import css from './AdvancedTriggersSelect.less'

type Props = {
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    isLightCampaign?: boolean
    onClick: (value: CampaignTriggerType) => void
}

export const AdvancedTriggersSelect = ({
    isConvertSubscriber = false,
    isShopifyStore = false,
    isLightCampaign = false,
    onClick,
}: Props): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const isShopifyHeadless = useIsHeadlessShopifyStore()

    const handleClickItem = (value: CampaignTriggerType) => {
        setIsOpen(false)
        onClick(value)
    }

    const openModal = () => {
        setIsOpen(false)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const options = useAvailableTriggerList({
        isConvertSubscriber,
        isShopifyStore,
        isShopifyHeadless,
        isLightCampaign,
    })

    const triggersAvailableToSubscribers = useAvailableTriggerList({
        isConvertSubscriber: true,
        isShopifyStore,
        isShopifyHeadless,
    })

    const upsellAvailable = !isConvertSubscriber && isShopifyStore

    const optionsForUpsell = useMemo(() => {
        if (!upsellAvailable) {
            return {}
        }

        return Object.keys(triggersAvailableToSubscribers).reduce(
            (acc, key: string) => {
                if (!options[key]) {
                    acc[key] = triggersAvailableToSubscribers[key]
                }
                return acc
            },
            {} as Record<string, TriggerConfigValue>,
        )
    }, [upsellAvailable, triggersAvailableToSubscribers, options])

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
                    (TriggerConfigValue & { key: CampaignTriggerType })[]
                >,
            ),
        [options],
    )

    return (
        <>
            <Button
                intent="secondary"
                name="add condition"
                data-testid="btn:add-condition" // used in e2e tests
                role="button"
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="material-icons mr-2" style={{ fontSize: 16 }}>
                    add
                </i>
                Add condition
                <i className="material-icons ml-2" style={{ fontSize: 20 }}>
                    arrow_drop_down
                </i>
            </Button>
            <Dropdown
                isOpen={isOpen}
                onToggle={setIsOpen}
                target={buttonRef}
                className={css.triggerDropdown}
            >
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
                        ),
                    )}
                    {upsellAvailable && (
                        <DropdownSection
                            title="Available with Convert"
                            key="upsell-triggers"
                        >
                            {Object.entries(optionsForUpsell).map(
                                ([key, option]) => (
                                    <DropdownItem
                                        key={key}
                                        option={{
                                            label: option.label,
                                            value: key as CampaignTriggerType,
                                        }}
                                        isDisabled={true}
                                        onClick={handleClickItem}
                                    />
                                ),
                            )}
                        </DropdownSection>
                    )}
                </DropdownBody>
                {upsellAvailable && (
                    <div className={css.upsellButtonBox}>
                        <Button fillStyle="ghost" onClick={openModal}>
                            Subscribe To Convert
                        </Button>
                    </div>
                )}
            </Dropdown>
            {upsellAvailable && (
                <ConvertSubscriptionModal
                    canduId={'campaign-triggers-convert-modal-body'}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSubscribe={closeModal}
                />
            )}
        </>
    )
}
