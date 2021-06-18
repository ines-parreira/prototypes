import React from 'react'
import {Alert} from 'reactstrap'
import {Link} from 'react-router-dom'

import CodeSnippet from '../../../../../../common/components/CodeSnippet'

import css from './CustomInstallationTabs.less'

type Props = {
    code: string
    integrationId: string
    sspAvailable: boolean
}

const SSPSnippet = `<script>
var gorgiasChatInterval = window.setInterval(function() {
    var container = document.querySelector('#gorgias-chat-container')
    if (window.GorgiasChat && GorgiasChat.hasOwnProperty("on")){
      GorgiasChat.setShopifyContext('XXXXX');
    }
}, 50);
</script>`

export function CustomInstallationShopifyTab({
    code,
    integrationId,
    sspAvailable,
}: Props) {
    return (
        <div className={css['wrapper']}>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>1</span>
                </div>
                <div className={css['instruction-text']}>
                    Go under <b>Themes</b> in your Online Store and click on{' '}
                    <b>Customize</b>
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>2</span>
                </div>
                <div className={css['instruction-text']}>
                    Then under <b>Theme actions</b>, click on <b>View theme</b>
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>3</span>
                </div>
                <div className={css['instruction-text']}>
                    Open file <b>theme.liquid</b> and scroll down to the bottom
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>4</span>
                </div>
                <div className={css['instruction-text']}>
                    Finally, copy the code below and paste it above the{' '}
                    <b>&#x3C;/body&#x3E;</b> tag
                </div>
            </div>
            <Alert color="warning">
                Please note that by copying the code to your Shopify{' '}
                <b>theme.liquid</b> files, the chat will also be shown on all
                webpages. Make sure to copy the code to just specific pages if
                needed.
            </Alert>
            <CodeSnippet code={code} />
            <h4>Enable Self-Service</h4>
            <p>
                This will enable self-service on your chat but you'll be able to
                control the settings from the{' '}
                <Link
                    to={`/app/settings/integrations/gorgias_chat/${integrationId}/self_service`}
                >
                    Self-Service page
                </Link>
                .
            </p>
            {sspAvailable ? (
                <>
                    <div className={css['instruction']}>
                        <div>
                            <span className={css['instruction-number']}>1</span>
                        </div>
                        <div className={css['instruction-text']}>
                            Add this code snippet just after the installation
                            code snippet from the previous step. Please remember
                            to <b>replace XXXX in the snippet below</b> with
                            your Shopify store name{' '}
                            <b>yourShop.myshopify.com</b>.
                        </div>
                    </div>

                    <CodeSnippet code={SSPSnippet} />
                    <div className={css['instruction']}>
                        <div>
                            <span className={css['instruction-number']}>2</span>
                        </div>
                        <div className={css['instruction-text']}>
                            Access your chat's{' '}
                            <Link to={`/app/settings/self-service`}>
                                Self-Service settings
                            </Link>{' '}
                            and activate the installation toggle for the
                            specific Shopify store site that you want to
                            activate the self-service portal on. If the toggle
                            turns green and stays green, then the self-service
                            portal is live on your site.
                        </div>
                    </div>
                </>
            ) : (
                <Alert color="warning">
                    The self-service features{' '}
                    <b>are not available for custom live chat</b>. Please
                    connect your live chat to a store in order to set-up
                    self-service features.
                </Alert>
            )}
        </div>
    )
}

export default CustomInstallationShopifyTab
