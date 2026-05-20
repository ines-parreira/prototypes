import type React from 'react'

import { Text } from '@gorgias/axiom'

import { ColorPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker'

import css from './GorgiasChatCreationWizardStepBranding.less'

type BrandColorPickerProps = {
    mainColor: string
    defaultMainColor: string
    onChange: (color: string) => void
    onFocus?: () => void
}

export const BrandColorPicker: React.FC<BrandColorPickerProps> = ({
    mainColor,
    defaultMainColor,
    onChange,
    onFocus,
}) => (
    <div className={css.section}>
        <Text variant="bold" size="md">
            Brand color
        </Text>
        <Text size="sm" className={css.caption}>
            Make your chat fit in with your brand color
        </Text>
        <ColorPicker
            className={css.colorPicker}
            value={mainColor}
            defaultValue={defaultMainColor}
            onChange={onChange}
            onFocus={onFocus}
            label="Main color"
        />
    </div>
)
