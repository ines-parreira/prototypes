import React, {useEffect, useMemo, useState} from 'react'
import {DropdownItem, DropdownMenu, DropdownToggle, Dropdown} from 'reactstrap'
import {
    getPhoneIntegrations,
    getSmsIntegrations,
} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'

import Tooltip from 'pages/common/components/Tooltip'

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

    const tooltipMessage = useMemo(() => {
        if (hasPhoneIntegrations && hasSmsIntegrations) {
            return 'Make an outbound call or send an SMS'
        }
        if (hasPhoneIntegrations && !hasSmsIntegrations) {
            return 'Make an outbound call'
        }
        if (!hasPhoneIntegrations && hasSmsIntegrations) {
            return 'Send SMS'
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
                    id={id}
                    tag="a"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                >
                    <Tooltip target={id}>{tooltipMessage}</Tooltip>
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
                                    Send SMS
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
