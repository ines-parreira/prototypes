import {List, Map} from 'immutable'
import React, {useState} from 'react'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'

import warningIcon from 'assets/img/icons/warning.svg'
import {getIconFromType} from 'state/integrations/helpers'

import css from './StoreNameDropdown.less'

type Props = {
    storeIntegrations: List<Map<any, any>>
    storeIntegrationId: number | null
    onChange: (newShopIntegrationIdValue: number) => void
}

export const StoreNameDropdown = ({
    storeIntegrations,
    storeIntegrationId,
    onChange,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) => storeIntegration?.get('id') === storeIntegrationId
    )

    return (
        <div className={css.wrapper}>
            <Dropdown
                className={css.dropdown}
                isOpen={isOpen}
                toggle={() => setIsOpen(!isOpen)}
            >
                <DropdownToggle caret>
                    {storeIntegration ? (
                        <span className={css.dropdownValue}>
                            <img
                                src={getIconFromType(
                                    storeIntegration.get('type')
                                )}
                                className={css.dropdownLogo}
                                alt="logo"
                            />
                            {storeIntegration.get('name')}
                        </span>
                    ) : (
                        <span className={css.dropdownPlaceholder}>
                            <i
                                className="material-icons"
                                style={{marginRight: 8, fontSize: 20}}
                            >
                                store
                            </i>
                            Select a store
                        </span>
                    )}
                </DropdownToggle>
                <DropdownMenu className={css.dropdownMenu}>
                    {storeIntegrations.map((option) => (
                        <DropdownItem
                            onClick={() => onChange(option?.get('id'))}
                            className={css.storeRow}
                            key={option?.get('id')}
                            value={option?.get('id')}
                        >
                            <img
                                src={getIconFromType(option?.get('type'))}
                                className={css.dropdownLogo}
                                alt="logo"
                            />
                            <span>{option?.get('name')}</span>
                            <span className={css.dropdownInfo}>
                                {option?.get('deactivated_datetime') && (
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
