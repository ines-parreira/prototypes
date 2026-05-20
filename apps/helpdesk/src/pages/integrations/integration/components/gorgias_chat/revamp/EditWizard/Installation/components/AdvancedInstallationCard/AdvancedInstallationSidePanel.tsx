import { useState } from 'react'

import type { Map } from 'immutable'

import {
    ButtonGroup,
    ButtonGroupItem,
    OverlayContent,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

import { useGetInstallationSnippet } from 'models/integration/queries'
import { useGetConvertBundle } from 'pages/convert/bundles/hooks/useGetConvertBundle'
import { useConvertBundleInChatSnippetEnabled } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInChatSnippetEnabled'
import { useConvertBundleInstallationSnippet } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInstallationSnippet'

import AnyOtherWebsiteContent from './AnyOtherWebsiteContent'
import GoogleTagManagerContent from './GoogleTagManagerContent'
import ShopifyWebsiteContent from './ShopifyWebsiteContent'

enum ButtonGroupKeys {
    SHOPIFY_WEBSITE = 'shopify-website',
    ANY_OTHER_WEBSITE = 'any-other-website',
    GOOGLE_TAG_MANAGER = 'google-tag-manager',
}

type ButtonGroupItemData = {
    title: string
    id: ButtonGroupKeys
}

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    integration: Map<any, any>
}

const AdvancedInstallationSidePanel = ({
    isOpen,
    onOpenChange,
    integration,
}: Props) => {
    const [selectedKey, setSelectedKey] = useState<ButtonGroupKeys>(
        ButtonGroupKeys.SHOPIFY_WEBSITE,
    )
    const chatId = integration.get('id')
    const storeId = integration.get('meta')?.get('shop_integration_id')
    const applicationId: string = integration.getIn(['meta', 'app_id'])

    const { data, isLoading: isLoadingInstallation } =
        useGetInstallationSnippet(
            { applicationId: applicationId! },
            { enabled: !!applicationId },
        )

    const { bundle, isLoading: isLoadingConvertBundle } = useGetConvertBundle(
        storeId,
        chatId,
        {
            staleTime: 0, // Always fetch when generating the snippet.
        },
    )
    const bundleSnippet = useConvertBundleInstallationSnippet(bundle?.id)
    const isBundleSnippetEnabled = useConvertBundleInChatSnippetEnabled()

    const applicationKey = data?.appKey

    let installationCode = data?.snippet
    if (isBundleSnippetEnabled) installationCode += '\n' + bundleSnippet

    const isLoadingInstallationCode =
        isLoadingInstallation || isLoadingConvertBundle

    const isLoadingApplicationKey = isLoadingInstallation

    const buttonGroups: ButtonGroupItemData[] = [
        {
            title: 'Shopify Website',
            id: ButtonGroupKeys.SHOPIFY_WEBSITE,
        },
        {
            title: 'Any Other Website',
            id: ButtonGroupKeys.ANY_OTHER_WEBSITE,
        },
        {
            title: 'Google Tag Manager',
            id: ButtonGroupKeys.GOOGLE_TAG_MANAGER,
        },
    ]

    let sidePanelContent
    switch (selectedKey) {
        case ButtonGroupKeys.SHOPIFY_WEBSITE:
            sidePanelContent = (
                <ShopifyWebsiteContent
                    isLoadingInstallationCode={isLoadingInstallationCode}
                    installationCode={installationCode}
                />
            )
            break
        case ButtonGroupKeys.ANY_OTHER_WEBSITE:
            sidePanelContent = (
                <AnyOtherWebsiteContent
                    isLoadingInstallationCode={isLoadingInstallationCode}
                    installationCode={installationCode}
                />
            )
            break
        case ButtonGroupKeys.GOOGLE_TAG_MANAGER:
            sidePanelContent = (
                <GoogleTagManagerContent
                    isLoadingApplicationKey={isLoadingApplicationKey}
                    applicationKey={applicationKey}
                />
            )
            break
    }

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader title="Advanced Installation"></OverlayHeader>
            <OverlayContent>
                <div>
                    <div>
                        <ButtonGroup
                            onSelectionChange={(key) =>
                                setSelectedKey(key as ButtonGroupKeys)
                            }
                            selectedKey={selectedKey}
                        >
                            {buttonGroups.map((item) => {
                                return (
                                    <ButtonGroupItem key={item.id} id={item.id}>
                                        {item.title}
                                    </ButtonGroupItem>
                                )
                            })}
                        </ButtonGroup>
                    </div>
                    {sidePanelContent}
                </div>
            </OverlayContent>
        </SidePanel>
    )
}

export default AdvancedInstallationSidePanel
