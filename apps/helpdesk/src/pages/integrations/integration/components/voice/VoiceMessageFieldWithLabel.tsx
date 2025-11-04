import { ComponentProps, ReactNode } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import DEPRECATED_VoiceMessageField from './DEPRECATED_VoiceMessageField'

import css from './VoiceMessageFieldWithLabel.less'

type Props = ComponentProps<typeof DEPRECATED_VoiceMessageField> & {
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
                <DEPRECATED_VoiceMessageField {...props} />
            </div>
        </div>
    )
}
