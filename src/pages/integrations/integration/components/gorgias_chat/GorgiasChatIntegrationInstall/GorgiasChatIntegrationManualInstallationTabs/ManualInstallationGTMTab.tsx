import React from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import InstallationStep from './components/InstallationStep'
import InstallationTab from './components/InstallationTab'

type Props = {
    applicationId: string
}

const ManualInstallationGTMTab = ({applicationId}: Props) => {
    return (
        <InstallationTab>
            <div>
                Google Tag Manager lets you modify libraries/snippets without
                touching the source code of your website or Shopify Theme.
            </div>

            <InstallationStep index={1}>
                In Google Tag Manager, click <b>Tags</b> in the menu
            </InstallationStep>
            <InstallationStep index={2}>
                Click <b>New</b> to create a new tag
            </InstallationStep>
            <InstallationStep index={3}>
                Search for <b>Gorgias Chat</b> and select it
            </InstallationStep>
            <InstallationStep index={4}>
                Enter your <b>Gorgias Chat App ID : {applicationId}</b>
            </InstallationStep>
            <InstallationStep index={5}>
                Select <b>All Pages - Page view</b> in the <b>Trigger</b>{' '}
                section
            </InstallationStep>
            <InstallationStep index={6}>Save and publish</InstallationStep>
            <Alert type={AlertType.Warning}>
                Please note that if you install chat through Google Tag
                Managers, customers using ad-blockers might not be able to see
                your chat widget.
            </Alert>
        </InstallationTab>
    )
}

export default ManualInstallationGTMTab
