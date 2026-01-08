import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'

import { Box, Button } from '@gorgias/axiom'

import IconLink from 'core/ui/components/IconLink'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'

type HeaderImportEmailProps = {
    onOpenCreateImportModal: () => void
    showCta: boolean
}

export const HeaderImport = ({
    onOpenCreateImportModal,
    showCta,
}: HeaderImportEmailProps) => {
    const historicalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)

    return (
        <>
            <PageHeader
                title={
                    historicalImportsEnabled ? 'Import data' : 'Email import'
                }
            >
                {showCta && (
                    <Button onClick={onOpenCreateImportModal}>Import</Button>
                )}
            </PageHeader>
            <div className={css.pageContainer}>
                <div className={classnames('body-regular', css.contentWrapper)}>
                    <div className={classnames(css.mb32)}>
                        {historicalImportsEnabled ? (
                            <p>Import external customer data to Gorgias.</p>
                        ) : (
                            <p>Import historical email data to Gorgias.</p>
                        )}
                        {historicalImportsEnabled ? (
                            <Box gap="sm">
                                <IconLink
                                    icon="menu_book"
                                    href="https://link.gorgias.com/2wb"
                                    content="Zendesk Migration"
                                />
                                <IconLink
                                    icon="menu_book"
                                    href="https://link.gorgias.com/vkf"
                                    content="Email integrations FAQs"
                                />
                            </Box>
                        ) : (
                            <IconLink
                                icon="menu_book"
                                href="https://link.gorgias.com/vkf"
                                content="Email Import Guide"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
