import classnames from 'classnames'

import navbarCss from 'assets/css/navbar.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import CreateTicketButton from './CreateTicketButton'

type CreateTicketNavbarButtonProps = { isDisabled?: boolean }

export default function CreateTicketNavbarButton({
    isDisabled,
}: CreateTicketNavbarButtonProps) {
    return (
        <CreateTicketButton
            isDisabled={isDisabled}
            shouldBindKeys
            trigger={
                <Button
                    className={classnames(navbarCss.navbarButton, 'flex-grow')}
                    fillStyle="ghost"
                    isDisabled={isDisabled}
                >
                    <ButtonIconLabel
                        icon="add"
                        className={navbarCss.buttonIcon}
                    />
                    Create Ticket
                </Button>
            }
        />
    )
}
