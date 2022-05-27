import React, {useEffect, useState} from 'react'
import {DropdownItem, DropdownMenu, DropdownToggle, Dropdown} from 'reactstrap'
import {
    getPhoneIntegrations,
    getSmsIntegrations,
} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'

import PhoneIntegrationsDropdownList from './PhoneIntegrationsDropdownList'
import SmsIntegrationsDropdownList from './SmsIntegrationsDropdownList'
import css from './ClickablePhoneNumber.less'

type Props = {
    id: string
    address: string
    customerId: string
    customerName: string
}

const ClickablePhoneNumber = ({
    id,
    address,
    customerId,
    customerName,
}: Props): JSX.Element => {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const smsIntegrations = useAppSelector(getSmsIntegrations)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showPhoneIntegrations, setShowPhoneIntegrations] = useState(false)
    const [showSmsIntegrations, setShowSmsIntegrations] = useState(false)

    const hasPhoneIntegrations = !!phoneIntegrations.length
    const hasSmsIntegrations = !!smsIntegrations.length

    useEffect(() => {
        if (hasPhoneIntegrations && !hasSmsIntegrations) {
            setShowPhoneIntegrations(true)
        }
        if (!hasPhoneIntegrations && hasSmsIntegrations) {
            setShowSmsIntegrations(true)
        }
    }, [hasPhoneIntegrations, hasSmsIntegrations])

    if (!hasPhoneIntegrations && !hasSmsIntegrations) {
        const href = address.replace(/[. ]/g, '')
        return (
            <a id={id} href={`tel:${href}`}>
                {address}
            </a>
        )
    }

    return (
        <>
            <Dropdown
                isOpen={isDropdownOpen}
                className={css.dropdown}
                toggle={() => {
                    setIsDropdownOpen(!isDropdownOpen)
                    setShowPhoneIntegrations(
                        hasPhoneIntegrations && !hasSmsIntegrations
                    )
                    setShowSmsIntegrations(
                        !hasPhoneIntegrations && hasSmsIntegrations
                    )
                }}
            >
                <DropdownToggle
                    tag="a"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                >
                    {address}
                </DropdownToggle>
                <DropdownMenu container="body" className={css.dropdownMenu}>
                    {hasPhoneIntegrations &&
                        hasSmsIntegrations &&
                        !showPhoneIntegrations &&
                        !showSmsIntegrations && (
                            <>
                                <DropdownItem
                                    toggle={false}
                                    onClick={() =>
                                        setShowPhoneIntegrations(true)
                                    }
                                >
                                    <i className="material-icons mr-2">phone</i>
                                    Make outbound call
                                </DropdownItem>
                                <DropdownItem
                                    toggle={false}
                                    onClick={() => setShowSmsIntegrations(true)}
                                >
                                    <i className="material-icons mr-2">sms</i>
                                    Send an SMS message
                                </DropdownItem>
                            </>
                        )}
                    {hasPhoneIntegrations && showPhoneIntegrations && (
                        <PhoneIntegrationsDropdownList
                            integrations={phoneIntegrations}
                            address={address}
                            customerName={customerName}
                        />
                    )}
                    {hasSmsIntegrations && showSmsIntegrations && (
                        <SmsIntegrationsDropdownList
                            integrations={smsIntegrations}
                            address={address}
                            customerName={customerName}
                            customerId={customerId}
                        />
                    )}
                </DropdownMenu>
            </Dropdown>
        </>
    )
}

export default ClickablePhoneNumber
