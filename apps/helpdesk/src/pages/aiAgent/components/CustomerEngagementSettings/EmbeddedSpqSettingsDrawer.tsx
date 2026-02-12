import { useCallback, useRef, useState } from 'react'

import { useCopyToClipboard } from '@repo/hooks'

import {
    Banner,
    Box,
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Modal,
    ModalSize,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

import aiFaqsDemoPoster from 'assets/img/ai-agent/ai-faqs-demo-poster.png'
import spqManualInstallStep1 from 'assets/img/spq/spq-manual-install-step-1.png'
import spqManualInstallStep2 from 'assets/img/spq/spq-manual-install-step-2.png'
import spqManualInstallStep3 from 'assets/img/spq/spq-manual-install-step-3.png'
import aiFaqsDemoVideo from 'assets/video/ai-faqs-demo.mp4'
import useAppDispatch from 'hooks/useAppDispatch'
import { getGorgiasMainThemeAppExtensionId } from 'pages/integrations/integration/components/gorgias_chat/hooks/useThemeAppExtensionInstallation'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './EmbeddedSpqSettingsDrawer.less'

enum InstallationMethods {
    QuickInstall = 'quick-install',
    Manual = 'manual',
}

const BLOCK_ID = `${getGorgiasMainThemeAppExtensionId()}/spq`
const SHOPIFY_THEME_EXTENSION_LINK_BASE = `https://{shopName}.myshopify.com/admin/themes/current/editor?template=product&addAppBlockId=${BLOCK_ID}&target=mainSection`

const QuickInstallationContent = ({
    shopName,
    isVideoModalOpen,
    setIsVideoModalOpen,
}: {
    shopName: string
    isVideoModalOpen: boolean
    setIsVideoModalOpen: (isOpen: boolean) => void
}) => {
    return (
        <>
            <Box className={css.listItem} flexDirection="column" gap={12}>
                <button
                    type="button"
                    className={css.videoThumbnailButton}
                    onClick={() => setIsVideoModalOpen(true)}
                    aria-label="Play AI FAQs Demo video"
                >
                    <div className={css.videoThumbnail}>
                        <img src={aiFaqsDemoPoster} alt="AI FAQs Demo" />
                        <div className={css.playIconOverlay}>
                            <Icon name="media-play-circle" size="lg" />
                        </div>
                    </div>
                </button>
                Help shoppers get answers faster by embedding AI FAQs in your
                product pages. Use your Shopify editor to place the widget and
                customize it to match your store.
                <Box>
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
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Edit in Shopify
                    </Button>
                </Box>
                <Box>
                    <Banner
                        icon="info"
                        intent="info"
                        isClosable={false}
                        title="Turning off this feature won't remove the code from your site"
                    >
                        Shoppers won&apos;t see the AI FAQs, but the code will
                        stay in your Shopify theme. To remove them completely,
                        delete the code snippet from your theme.
                    </Banner>
                </Box>
            </Box>

            <Modal
                isOpen={isVideoModalOpen}
                onOpenChange={setIsVideoModalOpen}
                size={ModalSize.Xl}
                aria-label="AI FAQs Demo video"
            >
                <div className={css.videoModalContent}>
                    <video
                        src={aiFaqsDemoVideo}
                        className={css.video}
                        controls
                        autoPlay
                        playsInline
                    />
                </div>
            </Modal>
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
                message: 'Code copied!',
                dismissAfter: 3000,
                status: NotificationStatus.Success,
            }),
        )
    }, [dispatch, copyToClipboard])

    return (
        <>
            <Box flexDirection="column" gap={24} className={css.manualSteps}>
                <Box flexDirection="column" gap={4}>
                    <Box>
                        <h3>
                            1. In your Shopify admin, go to&nbsp;
                            <a
                                className={css.link}
                                href={`https://admin.shopify.com/store/${shopName}/themes`}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Themes <Icon name="external-link" />
                            </a>
                        </h3>
                    </Box>
                    <Box>
                        <img
                            alt="Go to shopify theme"
                            src={spqManualInstallStep1}
                        />
                    </Box>
                </Box>

                <Box flexDirection="column" gap={4}>
                    <Box>
                        <h3>
                            2. Open the
                            <span className={css.kebabIcon}>
                                <Icon name="dots-kebab-vertical" />
                            </span>
                            menu, then click&nbsp;
                            <strong>Edit Code</strong>
                        </h3>
                    </Box>
                    <Box>
                        <img
                            alt="Click on edit theme"
                            src={spqManualInstallStep2}
                        />
                    </Box>
                </Box>

                <Box flexDirection="column" gap={4}>
                    <Box>
                        <h3>
                            3. Find the .liquid template for your product pages
                            (for example, in the default Dawn theme, the product
                            page template is main-product.liquid).
                        </h3>
                    </Box>
                    <Box>
                        <img
                            alt="Find your page template"
                            src={spqManualInstallStep3}
                        />
                    </Box>
                </Box>

                <Box flexDirection="column" gap={4}>
                    <Box>
                        <h3>
                            <span>
                                4. Copy and paste the code snippet from Gorgias
                                into the template for your product page, then
                                click <strong>Save</strong>.
                            </span>
                        </h3>
                    </Box>
                    <Box>
                        <div className={css.codeSnippet}>
                            <Button
                                leadingSlot="copy"
                                intent="regular"
                                variant="primary"
                                data-testid="embedded-spq-copy-button"
                                onClick={handleCopyCode}
                                size="sm"
                            >
                                Copy code
                            </Button>
                            <pre>{spqScript.current}</pre>
                        </div>
                    </Box>
                </Box>
                <Box>
                    <Banner
                        icon="info"
                        intent="info"
                        isClosable={false}
                        title="Custom Styling"
                    >
                        <span>
                            Note: to change the position and style the AI FAQs
                            component, you may need to add{' '}
                            <a
                                className={css.link}
                                href="https://help.shopify.com/en/manual/online-store/themes/customizing-themes/edit-code/add-css"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                custom CSS <Icon name="external-link" />
                            </a>
                            .
                        </span>
                    </Banner>
                </Box>
            </Box>
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
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onClose}
            isDismissable={!isVideoModalOpen}
        >
            <OverlayHeader
                title="AI FAQs: Embedded in page"
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
                                Shopify quick install
                            </ButtonGroupItem>
                            <ButtonGroupItem id={InstallationMethods.Manual}>
                                Insert code snippet
                            </ButtonGroupItem>
                        </ButtonGroup>
                    </>
                }
            />

            <div className={css.overlayContent}>
                <div className={css.installInstructions}>
                    {selectedMethod === InstallationMethods.QuickInstall && (
                        <QuickInstallationContent
                            shopName={shopName}
                            isVideoModalOpen={isVideoModalOpen}
                            setIsVideoModalOpen={setIsVideoModalOpen}
                        />
                    )}
                    {selectedMethod === InstallationMethods.Manual && (
                        <ManualInstallationContent shopName={shopName} />
                    )}
                </div>
            </div>
        </SidePanel>
    )
}
