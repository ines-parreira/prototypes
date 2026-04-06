import classnames from 'classnames'

import { Box, Button } from '@gorgias/axiom'

import IconLink from 'core/ui/components/IconLink'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'

import importCss from './Import.less'

type HeaderImportEmailProps = {
    onOpenCreateImportModal: () => void
    showCta: boolean
}

export const HeaderImport = ({
    onOpenCreateImportModal,
    showCta,
}: HeaderImportEmailProps) => {
    return (
        <>
            <PageHeader title="Import data">
                {showCta && (
                    <Button onClick={onOpenCreateImportModal}>Import</Button>
                )}
            </PageHeader>
            <div className={importCss.pageContainer}>
                <div className={classnames('body-regular', css.contentWrapper)}>
                    <div className={classnames(css.mb32)}>
                        <p>Import external customer data to Gorgias.</p>
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
                    </div>
                </div>
            </div>
        </>
    )
}
