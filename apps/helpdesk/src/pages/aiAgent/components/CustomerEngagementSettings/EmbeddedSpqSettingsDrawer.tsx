import { useCallback, useRef, useState } from 'react'

import { useCopyToClipboard } from '@repo/hooks'
import classNames from 'classnames'

import {
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

import spqManualInstallStep1 from 'assets/img/spq/spq-manual-install-step-1.png'
import spqManualInstallStep2 from 'assets/img/spq/spq-manual-install-step-2.png'
import spqManualInstallStep3 from 'assets/img/spq/spq-manual-install-step-3.png'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './EmbeddedSpqSettingsDrawer.less'

enum InstallationMethods {
    QuickInstall = 'quick-install',
    Manual = 'manual',
}

const SHOPIFY_THEME_EXTENSION_LINK_BASE = 'https://shopify.com'

const QuickInstallationContent = ({ shopName }: { shopName: string }) => {
    return (
        <>
            <div className={css.listItem}>
                Easily add suggested product questions to your product pages.
                Select the widget in your Shopify editor, then customize the
                look and feel to match your store.
                <br />
                <br />
                Note that turning off this feature won&apos;t remove the code
                from your website. To permanently delete the widget, delete the
                code snippet from your website.
                <br />
                <br />
                <Button
                    as="a"
                    trailingSlot="external-link"
                    intent="regular"
                    variant="primary"
                    data-testid="embedded-spq-copy-button"
                    href={SHOPIFY_THEME_EXTENSION_LINK_BASE.replace(
                        '{shopName}',
                        shopName,
                    )}
                >
                    Edit in Shopify
                </Button>
            </div>
        </>
    )
}

const ManualInstallationContent = ({ shopName }: { shopName: string }) => {
    const dispatch = useAppDispatch()
    const [__clipboardState, copyToClipboard] = useCopyToClipboard()

    const spqScript = useRef(
        `<script id="gorgias-spq-script" src="https://config.gorgias.chat/conversation-starters/spq.js?shop=${shopName}.myshopify.com&source=manual"></script>`,
    )

    const handleCopyCode = useCallback(() => {
        copyToClipboard(spqScript.current)

        dispatch(
            notify({
                message: 'Code successfully copied.',
                dismissAfter: 3000,
                status: NotificationStatus.Success,
            }),
        )
    }, [dispatch, copyToClipboard])

    return (
        <>
            <div className={css.listItem}>
                <h3>
                    1. Go in shopify&nbsp;
                    <a
                        className={css.link}
                        href={`https://admin.shopify.com/store/${shopName}/themes`}
                        target="_blank"
                    >
                        Themes <Icon name="external-link" />
                    </a>
                </h3>
                <img src={spqManualInstallStep1} alt="Go to shopify them"></img>
            </div>

            <div className={css.listItem}>
                <h3>
                    2. Next to Edit theme, tap{' '}
                    <span className={css.kebabIcon}>
                        <Icon name="dots-kebab-vertical" />
                    </span>{' '}
                    and click Edit Code
                </h3>
                <img
                    src={spqManualInstallStep2}
                    alt="Click on edit theme"
                ></img>
            </div>

            <div className={css.listItem}>
                <h3>3. Find your product page template filed</h3>
                <img
                    src={spqManualInstallStep3}
                    alt="Find product page template file"
                ></img>
            </div>

            <div className={classNames(css.listItem, 'axiom')}>
                <h3>4. Copy and paste this code snippet</h3>
                <div className={css.codeSnippet}>
                    <Button
                        leadingSlot="copy"
                        intent="regular"
                        variant="primary"
                        data-testid="embedded-spq-copy-button"
                        onClick={handleCopyCode}
                    >
                        Copy code
                    </Button>
                    <pre>{spqScript.current}</pre>
                </div>
            </div>
        </>
    )
}

export const EmbeddedSpqSettingsDrawer = ({
    isOpen,
    onClose,
    shopName,
}: {
    isOpen: boolean
    onClose: () => void
    shopName: string
}) => {
    const [selectedMethod, setSelectedMethod] = useState(
        InstallationMethods.QuickInstall,
    )

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onClose}>
            <OverlayHeader
                title="Embedded product questions"
                description={
                    <>
                        <ButtonGroup
                            onSelectionChange={(type) => {
                                setSelectedMethod(type as InstallationMethods)
                            }}
                            selectedKey={selectedMethod}
                        >
                            <ButtonGroupItem
                                id={InstallationMethods.QuickInstall}
                            >
                                Shopify Quick Install
                            </ButtonGroupItem>
                            <ButtonGroupItem id={InstallationMethods.Manual}>
                                Insert code block
                            </ButtonGroupItem>
                        </ButtonGroup>
                    </>
                }
            />

            <div className={css.overlayContent}>
                <div className={css.installInstructions}>
                    {selectedMethod === InstallationMethods.QuickInstall && (
                        <QuickInstallationContent shopName={shopName} />
                    )}
                    {selectedMethod === InstallationMethods.Manual && (
                        <ManualInstallationContent shopName={shopName} />
                    )}
                </div>
            </div>
        </SidePanel>
    )
}
