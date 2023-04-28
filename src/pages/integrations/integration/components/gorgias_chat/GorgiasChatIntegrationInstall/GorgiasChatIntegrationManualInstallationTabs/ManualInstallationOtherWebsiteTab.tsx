import React from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import InstallationStep from './components/InstallationStep'
import InstallationTab from './components/InstallationTab'
import InstallationCodeSnippet from './components/InstallationCodeSnippet'

type Props = {
    code?: string
}

const ManualInstallationOtherWebsiteTab = ({code}: Props) => {
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
            <Alert type={AlertType.Warning}>
                Please not that by inserting this snippet on your webpage, it
                will load the chat on that specific webpage only. Make sure to
                insert the snippet on all the pages for which you wish to
                display the chat widget.
            </Alert>
        </InstallationTab>
    )
}

export default ManualInstallationOtherWebsiteTab
