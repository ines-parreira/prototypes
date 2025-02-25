import React from 'react'

import Button from 'pages/common/components/button/Button'

export default function WhatsappBusinessManagerLinkButton() {
    return (
        <Button
            intent="secondary"
            onClick={() =>
                window
                    .open(
                        'https://business.facebook.com/wa/manage/message-templates/',
                        '_blank',
                    )!
                    .focus()
            }
            leadingIcon="open_in_new"
        >
            Manage & Create Templates
        </Button>
    )
}
