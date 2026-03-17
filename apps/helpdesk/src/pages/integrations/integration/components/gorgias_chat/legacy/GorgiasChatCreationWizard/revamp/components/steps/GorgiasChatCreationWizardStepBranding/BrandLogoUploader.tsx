import type React from 'react'

import { Text } from '@gorgias/axiom'

import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'

import css from './GorgiasChatCreationWizardStepBranding.less'

type BrandLogoUploaderProps = {
    headerPictureUrl: string | undefined
    onChange: (url: string | undefined) => void
    onFocus?: () => void
}

export const BrandLogoUploader: React.FC<BrandLogoUploaderProps> = ({
    headerPictureUrl,
    onChange,
    onFocus,
}) => (
    <div className={css.section}>
        <Text variant="bold" size="md">
            Home page logo
        </Text>
        <Text size="sm" className={css.caption}>
            Add a PNG, JPG or GIF horizontal logo with a transparent background.
        </Text>
        <span onFocus={onFocus}>
            <LogoUpload url={headerPictureUrl} onChange={onChange} />
        </span>
    </div>
)
