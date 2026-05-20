import {
    Box,
    Heading,
    HeadingSize,
    Image,
    Skeleton,
    Text,
} from '@gorgias/axiom'

import editCode from 'assets/img/chat-settings/edit-code.png'
import findBody from 'assets/img/chat-settings/find-body.png'
import searchForThemes from 'assets/img/chat-settings/search-for-themes.png'
import CodeSnippet from 'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CodeSnippet'

import css from './AdvancedInstallationSidePanel.less'

type Props = {
    installationCode?: string
    isLoadingInstallationCode: boolean
}

const ShopifyWebsiteContent = ({
    installationCode,
    isLoadingInstallationCode,
}: Props) => {
    const Fallback = () => {
        return (
            <Box
                alignItems="center"
                justifyContent="center"
                className={css.fallback}
            >
                <Text size="sm" color="content-neutral-tertiary">
                    Image unavailable
                </Text>
            </Box>
        )
    }

    return (
        <div className={css.sidePanelContent}>
            <div className={css.description}>
                <Text>
                    By copying the code to your Shopify theme.liquid files, the
                    chat will also be shown on all webpages. Make sure to copy
                    the code to just specific pages if needed.
                </Text>
            </div>
            <div className={css.content}>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        1. Go to your store&apos;s admin panel and search for
                        Themes
                    </Heading>
                    <Image
                        src={searchForThemes}
                        alt="Search for theme instruction"
                        fallback={<Fallback />}
                    ></Image>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        2. Click the three-dot menu next to Customize, then
                        click &quot;Edit code&quot;.
                    </Heading>
                    <Image
                        src={editCode as string}
                        alt="Edit code instruction"
                        fallback={<Fallback />}
                    ></Image>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        3. Open file theme.liquid, scroll down to the bottom and
                        find the <code>&lt;/body&gt;</code> tag
                    </Heading>
                    <Image
                        src={findBody as string}
                        alt="Find body instruction"
                        fallback={<Fallback />}
                    ></Image>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        4. Paste the code below directly above the{' '}
                        <code>&lt;/body&gt;</code> tag
                    </Heading>
                    {isLoadingInstallationCode ? (
                        <Skeleton width={452} height={250} />
                    ) : (
                        installationCode && (
                            <CodeSnippet
                                codeSnippet={installationCode.trim()}
                                withCopyButton={true}
                            ></CodeSnippet>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopifyWebsiteContent
