import React from 'react'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

export default function WhatsappBusinessManagerLinkButton() {
    return (
        <Button
            intent="secondary"
            onClick={() =>
                window
                    .open(
                        'https://business.facebook.com/wa/manage/message-templates/',
                        '_blank'
                    )!
                    .focus()
            }
        >
            <ButtonIconLabel icon="open_in_new" position="left">
                Manage & Create Templates
            </ButtonIconLabel>
        </Button>
    )
}
