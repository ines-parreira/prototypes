import { useRef } from 'react'

import { Link, useLocation } from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import { Navigation } from 'components/Navigation/Navigation'
import useShortcuts from 'hooks/useShortcuts'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import { useCreateTicketButton } from 'pages/common/components/CreateTicket/useCreateTicketButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import css from './CreateTicketNavbarButtonV2.less'

export function CreateTicketNavbarButtonV2() {
    const { pathname } = useLocation()
    const isDisabled = pathname.includes('/ticket/new')
    const dropdownTargetRef = useRef<HTMLButtonElement>(null)
    const {
        hasDraft,
        onResumeDraft,
        onDiscardDraft,
        createTicketActions,
        createTicketPath,
    } = useCreateTicketButton()
    useShortcuts('CreateTicketButton', createTicketActions)

    if (!hasDraft) {
        return (
            <div className={css.createTicketWrapper}>
                <Navigation.SectionItem
                    as={Link}
                    to={createTicketPath}
                    className={css.createTicketCTA}
                >
                    <ButtonIconLabel
                        icon="add"
                        className={navbarCss.buttonIcon}
                    />
                    Create ticket
                </Navigation.SectionItem>
            </div>
        )
    }

    return (
        <div className={css.createTicketWrapper}>
            <Navigation.SectionItem
                ref={dropdownTargetRef}
                disabled={isDisabled}
                as="button"
                className={css.createTicketCTA}
            >
                <ButtonIconLabel icon="add" className={navbarCss.buttonIcon} />
                Create ticket
            </Navigation.SectionItem>
            <UncontrolledDropdown
                target={dropdownTargetRef}
                placement="bottom-end"
                isDisabled={isDisabled}
            >
                <DropdownBody>
                    <DropdownItem
                        option={{
                            label: 'Resume draft',
                            value: 'resume',
                        }}
                        onClick={onResumeDraft}
                        shouldCloseOnSelect
                    />

                    <DropdownItem
                        option={{
                            label: 'Discard and create new ticket',
                            value: 'discard',
                        }}
                        onClick={() => onDiscardDraft(createTicketPath)}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </UncontrolledDropdown>
        </div>
    )
}
