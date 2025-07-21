import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import InstallationCodeSnippet from 'pages/common/components/InstallationCodeSnippet/InstallationCodeSnippet'

import InstallationStep from './components/InstallationStep'
import InstallationTab from './components/InstallationTab'

type Props = {
    code?: string
    alertMessage?: React.ReactNode
}

const ManualInstallationShopifyWebsiteTab = ({ code, alertMessage }: Props) => {
    return (
        <InstallationTab>
            <InstallationStep index={1}>
                {`Go to your store's admin panel and search for `}
                <b>Themes</b>
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
            {alertMessage && (
                <Alert type={AlertType.Warning}>{alertMessage}</Alert>
            )}
        </InstallationTab>
    )
}

export default ManualInstallationShopifyWebsiteTab
