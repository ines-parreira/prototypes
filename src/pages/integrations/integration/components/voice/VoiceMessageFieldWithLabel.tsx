import { ComponentProps, ReactNode } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import VoiceMessageField from './VoiceMessageField'

import css from './VoiceMessageFieldWithLabel.less'

type Props = ComponentProps<typeof VoiceMessageField> & {
    label: string
    tooltip?: string | ReactNode
}

export default function VoiceMessageFieldWithLabel({
    label,
    tooltip,
    ...props
}: Props) {
    return (
        <div className={css.container}>
            <Label className={css.label}>
                {label}
                {tooltip && <IconTooltip>{tooltip}</IconTooltip>}
            </Label>
            <div>
                <VoiceMessageField {...props} />
            </div>
        </div>
    )
}
