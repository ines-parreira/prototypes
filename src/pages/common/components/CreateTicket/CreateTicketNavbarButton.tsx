import React from 'react'
import classnames from 'classnames'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import navbarCss from 'assets/css/navbar.less'

import CreateTicketButton from './CreateTicketButton'

type CreateTicketNavbarButtonProps = {isDisabled?: boolean}

export default function CreateTicketNavbarButton({
    isDisabled,
}: CreateTicketNavbarButtonProps) {
    return (
        <CreateTicketButton
            isDisabled={isDisabled}
            trigger={
                <Button
                    className={classnames(navbarCss.navbarButton, 'flex-grow')}
                    fillStyle="ghost"
                    isDisabled={isDisabled}
                >
                    <ButtonIconLabel
                        icon="add"
                        iconClassName={navbarCss.buttonIcon}
                    />
                    Create Ticket
                </Button>
            }
        />
    )
}
