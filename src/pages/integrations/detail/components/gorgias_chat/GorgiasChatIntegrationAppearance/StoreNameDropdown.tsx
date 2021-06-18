import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import React, {useState} from 'react'
import {List, Map} from 'immutable'

import shopifyStore from '../../../../../../../img/icons/shopifyStore.svg'
import warningIcon from '../../../../../../../img/icons/warning.svg'

import css from './StoreNameDropdown.less'

type Props = {
    gorgiasChatIntegrations: List<Map<any, any>>
    shopifyIntegrations: List<Map<any, any>>
    value: string
    placeholder: string
    onChange: (
        newShopNameValue: string,
        newShopIntegrationIdValue: number
    ) => void
}

export const StoreNameDropdown = ({
    shopifyIntegrations,
    gorgiasChatIntegrations,
    value,
    onChange,
    placeholder,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const nrOfChatsInstalled: {[key: string]: number} = {}
    gorgiasChatIntegrations.forEach((gorgiasChatIntegration) => {
        const storeName: string = gorgiasChatIntegration?.getIn(
            ['meta', 'shop_name'],
            null
        )

        if (storeName) {
            if (!nrOfChatsInstalled[storeName]) {
                nrOfChatsInstalled[storeName] = 1
            } else {
                nrOfChatsInstalled[storeName] += 1
            }
        }
    })

    const getShopStoreDisplayText = (
        nrOfChatsInstalled: {[key: string]: number},
        shopifyIntegration?: Map<any, any>
    ) => {
        const storeName: string = shopifyIntegration?.getIn([
            'meta',
            'shop_name',
        ])
        if (!storeName) {
            return null
        }

        const nr: number = nrOfChatsInstalled[storeName]
        if (!nr) {
            return null
        }
        return nr
            .toString()
            .concat(nr > 1 ? ' connected chats' : ' connected chat')
    }

    const _onClickDropdownItem = (
        storeName: string,
        storeIntegrationId: number
    ) => {
        onChange(storeName, storeIntegrationId)
    }

    return (
        <div className={css.wrapper}>
            <Dropdown
                className={css.dropdown}
                isOpen={isOpen}
                toggle={() => setIsOpen(!isOpen)}
                required
            >
                <DropdownToggle caret>
                    {value ? (
                        <span className={css.dropdownValue}>
                            <img
                                src={shopifyStore}
                                alt="shopifyStore"
                                style={{marginRight: 16}}
                            />
                            {value}
                        </span>
                    ) : (
                        <span className={css.dropdownPlaceholder}>
                            {placeholder}
                        </span>
                    )}
                </DropdownToggle>
                <DropdownMenu className={css.dropdownMenu}>
                    {shopifyIntegrations.map((option) => (
                        <DropdownItem
                            onClick={() =>
                                _onClickDropdownItem(
                                    option?.getIn(['meta', 'shop_name']),
                                    option?.get('id')
                                )
                            }
                            className={css.storeRow}
                            key={option?.get('id')}
                            value={option?.get('id')}
                        >
                            <div className={css.innerItem}>
                                <img src={shopifyStore} alt="shopifyStore" />
                                <span>
                                    {option?.getIn(['meta', 'shop_name'])}
                                </span>
                            </div>
                            <span className={css.dropdownInfo}>
                                {!option?.get('deactivated_datetime') ? (
                                    getShopStoreDisplayText(
                                        nrOfChatsInstalled,
                                        option
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
