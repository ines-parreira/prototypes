import React, { useState } from 'react'

import classnames from 'classnames'
import type { List, Map } from 'immutable'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import warningIcon from 'assets/img/icons/warning.svg'
import { getIconFromType } from 'state/integrations/helpers'

import css from './StoreNameDropdown.less'

type Props = {
    gorgiasChatIntegrations: List<Map<any, any>>
    storeIntegrations: List<Map<any, any>>
    storeIntegrationId: number | null
    onChange: (newShopIntegrationIdValue: number) => void
    hasError?: boolean
    isDisabled?: boolean
    selectLabel?: string
}

export const StoreNameDropdown = ({
    storeIntegrations,
    gorgiasChatIntegrations,
    storeIntegrationId,
    onChange,
    hasError,
    isDisabled,
    selectLabel,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const nrOfChatsInstalled: { [key: number]: number } = {}
    gorgiasChatIntegrations.forEach((gorgiasChatIntegration) => {
        const shopIntegrationId: number | null = gorgiasChatIntegration?.getIn(
            ['meta', 'shop_integration_id'],
            null,
        )

        if (shopIntegrationId) {
            if (!nrOfChatsInstalled[shopIntegrationId]) {
                nrOfChatsInstalled[shopIntegrationId] = 1
            } else {
                nrOfChatsInstalled[shopIntegrationId] += 1
            }
        }
    })

    const getShopStoreDisplayText = (
        nrOfChatsInstalled: { [key: string]: number },
        storeIntegration?: Map<any, any>,
    ) => {
        const id: number = storeIntegration?.get('id')
        const nr: number = nrOfChatsInstalled[id]
        if (!nr) {
            return null
        }
        return nr
            .toString()
            .concat(nr > 1 ? ' connected chats' : ' connected chat')
    }

    const _onClickDropdownItem = (storeIntegrationId: number) => {
        onChange(storeIntegrationId)
    }

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) =>
            storeIntegration?.get('id') === storeIntegrationId,
    )

    return (
        <div className={css.wrapper}>
            <Dropdown
                className={css.dropdown}
                isOpen={isOpen}
                toggle={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
            >
                <DropdownToggle
                    id={'store-select'}
                    className={classnames({ [css.hasError]: hasError })}
                    caret
                    disabled={isDisabled}
                >
                    {storeIntegration ? (
                        <span className={css.dropdownValue}>
                            {getIconFromType(storeIntegration.get('type')) && (
                                <img
                                    src={getIconFromType(
                                        storeIntegration.get('type'),
                                    )}
                                    className={css.dropdownLogo}
                                    alt="logo"
                                />
                            )}
                            {storeIntegration.get('name')}
                        </span>
                    ) : (
                        <span className={css.dropdownPlaceholder}>
                            <i
                                className="material-icons"
                                style={{ marginRight: 8, fontSize: 20 }}
                            >
                                store
                            </i>
                            {selectLabel || 'Select a store'}
                        </span>
                    )}
                </DropdownToggle>
                <DropdownMenu className={css.dropdownMenu}>
                    {storeIntegrations.toArray().map((option) => (
                        <DropdownItem
                            onClick={() =>
                                _onClickDropdownItem(option?.get('id'))
                            }
                            className={css.storeRow}
                            key={option?.get('id')}
                            value={option?.get('id')}
                        >
                            {getIconFromType(option?.get('type')) && (
                                <img
                                    src={getIconFromType(option?.get('type'))}
                                    className={css.dropdownLogo}
                                    alt="logo"
                                />
                            )}
                            <span>{option?.get('name')}</span>
                            <span className={css.dropdownInfo}>
                                {!option?.get('deactivated_datetime') ? (
                                    getShopStoreDisplayText(
                                        nrOfChatsInstalled,
                                        option,
                                    )
                                ) : (
                                    <>
                                        <img
                                            src={warningIcon}
                                            alt="warning icon"
                                            className={`material-icons ${css['warning-icon']}`}
                                        />
                                        <span
                                            className={
                                                css.dropdownDisconnectedInfo
                                            }
                                        >
                                            Disconnected store
                                        </span>
                                    </>
                                )}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}
