import React from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import InstallationStep from './components/InstallationStep'
import InstallationTab from './components/InstallationTab'
import InstallationCodeSnippet from './components/InstallationCodeSnippet'

type Props = {
    code?: string
}

const ManualInstallationShopifyWebsiteTab = ({code}: Props) => {
    return (
        <InstallationTab>
            <InstallationStep index={1}>
                Go to your store's admin panel and search for <b>Themes</b>
            </InstallationStep>
            <InstallationStep index={2}>
                Click the <b>three-dot menu</b> next to Customize, then click{' '}
                <b>Edit code</b>
            </InstallationStep>
            <InstallationStep index={3}>
                Open file <b>theme.liquid</b>, scroll down to the bottom and
                find the <b>&#x3C;/body&#x3E;</b> tag
            </InstallationStep>
            <InstallationStep index={4}>
                Paste the code below directly above the <b>&#x3C;/body&#x3E;</b>{' '}
                tag
            </InstallationStep>
            <InstallationCodeSnippet code={code} />
            <Alert type={AlertType.Warning}>
                Please note that by copying the code to your Shopify{' '}
                <b>theme.liquid</b> files, the chat will also be shown on all
                webpages. Make sure to copy the code to just specific pages if
                needed.
            </Alert>
        </InstallationTab>
    )
}

export default ManualInstallationShopifyWebsiteTab
