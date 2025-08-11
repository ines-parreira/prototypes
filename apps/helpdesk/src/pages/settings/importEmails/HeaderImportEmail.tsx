import classnames from 'classnames'

import { Button } from '@gorgias/axiom'

import IconLink from 'core/ui/components/IconLink'
import PageHeader from 'pages/common/components/PageHeader'

import css from '../settings.less'

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
                            href="https://link.gorgias.com/m8v"
                            content="Email integrations FAQs"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeaderImportEmail
