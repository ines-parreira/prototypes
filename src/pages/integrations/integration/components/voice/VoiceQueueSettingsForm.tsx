import React, { ComponentProps, ReactNode } from 'react'

import { Form } from 'core/forms'

type Props = {
    children: ReactNode
    onSubmit: ComponentProps<typeof Form>['onValidSubmit']
}

export default function VoiceQueueSettingsForm({
    children,
    onSubmit,
}: Props): JSX.Element {
    return <Form onValidSubmit={onSubmit}>{children}</Form>
}
