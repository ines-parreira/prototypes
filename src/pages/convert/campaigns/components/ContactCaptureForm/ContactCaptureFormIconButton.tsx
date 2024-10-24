import {Tooltip} from '@gorgias/ui-kit'
import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'

type Props = {
    onOpenChange: (value: boolean) => void
    isDisabled: boolean
}

export const ContactFormCaptureFormIconButton = (props: Props) => {
    return (
        <>
            <IconButton
                size="small"
                fillStyle="ghost"
                intent="secondary"
                id="contactFormButton"
                onClick={() => props.onOpenChange(true)}
                isDisabled={props.isDisabled}
            >
                wysiwyg
            </IconButton>
            <Tooltip target="contactFormButton" placement="bottom">
                {props.isDisabled
                    ? 'Only one contact form is allowed per campaign'
                    : 'Insert Email Capture Form'}
            </Tooltip>
        </>
    )
}
