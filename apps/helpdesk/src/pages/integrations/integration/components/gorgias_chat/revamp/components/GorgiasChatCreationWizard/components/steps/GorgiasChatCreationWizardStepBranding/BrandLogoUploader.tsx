import type React from 'react'

import { Card, CardContent, CardHeader, Text } from '@gorgias/axiom'

import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'

import css from './GorgiasChatCreationWizardStepBranding.less'

type BrandLogoUploaderProps = {
    headerPictureUrl: string | undefined
    headerAlternativePictureUrl: string | undefined
    onDefaultLogoChange: (url: string | undefined) => void
    onAlternativeLogoChange: (url: string | undefined) => void
    onFocus?: () => void
    onAlternativeFocus?: () => void
}

export const BrandLogoUploader: React.FC<BrandLogoUploaderProps> = ({
    headerPictureUrl,
    headerAlternativePictureUrl,
    onDefaultLogoChange,
    onAlternativeLogoChange,
    onFocus,
    onAlternativeFocus,
}) => (
    <>
        <div className={css.section}>
            <Text variant="bold" size="md">
                Home page logo
            </Text>
            <Text size="sm" className={css.caption}>
                Add a PNG, JPG or GIF horizontal logo with a transparent
                background. You only need an alternative logo if your default
                isn&apos;t visible on white backgrounds.
            </Text>

            <div className={css.logoUploadsContainer}>
                <Card onFocus={onFocus}>
                    <CardHeader
                        title="Default logo"
                        description="Works on your brand color"
                    />
                    <CardContent>
                        <LogoUpload
                            url={headerPictureUrl}
                            onChange={onDefaultLogoChange}
                        />
                    </CardContent>
                </Card>

                <Card onFocus={onAlternativeFocus}>
                    <CardHeader
                        title="Alternative logo"
                        description="Works on white backgrounds"
                    />
                    <CardContent>
                        <LogoUpload
                            url={headerAlternativePictureUrl}
                            onChange={onAlternativeLogoChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    </>
)
