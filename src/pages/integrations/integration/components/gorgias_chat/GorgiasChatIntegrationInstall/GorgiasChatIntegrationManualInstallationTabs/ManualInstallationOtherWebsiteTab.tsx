import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import InstallationCodeSnippet from 'pages/common/components/InstallationCodeSnippet/InstallationCodeSnippet'

import InstallationStep from './components/InstallationStep'
import InstallationTab from './components/InstallationTab'

type Props = {
    code?: string
    alertMessage?: React.ReactNode
}

const ManualInstallationOtherWebsiteTab = ({ code, alertMessage }: Props) => {
    return (
        <InstallationTab>
            <InstallationStep index={1}>
                Edit the source code of your website and find the closing HTML
                tag <b>&#x3C;/body&#x3E;</b>
            </InstallationStep>
            <InstallationStep index={2}>
                Above the <b>&#x3C;/body&#x3E;</b> tag, paste the code snippet
                below
            </InstallationStep>
            <InstallationStep index={3}>
                Save and publish the changes
            </InstallationStep>
            <InstallationCodeSnippet code={code} />
            {alertMessage && (
                <Alert type={AlertType.Warning}>{alertMessage}</Alert>
            )}
        </InstallationTab>
    )
}

export default ManualInstallationOtherWebsiteTab
