import classnames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import IconLink from 'core/ui/components/IconLink'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'

type HeaderImportEmailProps = {
    onOpenCreateImportModal: () => void
    showCta: boolean
}

const HeaderImportEmail = ({
    onOpenCreateImportModal,
    showCta,
}: HeaderImportEmailProps) => {
    return (
        <>
            <PageHeader title="Email import">
                {showCta && (
                    <Button onClick={onOpenCreateImportModal}>Import</Button>
                )}
            </PageHeader>
            <div className={css.pageContainer}>
                <div className={classnames('body-regular', css.contentWrapper)}>
                    <div className={classnames(css.mb32)}>
                        <p>Import historical email data to Gorgias.</p>

                        <IconLink
                            icon="menu_book"
                            href="https://link.gorgias.com/vkf"
                            content="Email Import Guide"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeaderImportEmail
