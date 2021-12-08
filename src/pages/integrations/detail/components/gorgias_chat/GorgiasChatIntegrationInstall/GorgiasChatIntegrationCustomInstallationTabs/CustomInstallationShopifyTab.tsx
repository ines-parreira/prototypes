import React from 'react'

import CodeSnippet from '../../../../../../common/components/CodeSnippet'
import Alert, {AlertType} from '../../../../../../common/components/Alert/Alert'

import css from './CustomInstallationTabs.less'

type Props = {
    code: string
    integrationId: string
    sspAvailable: boolean
}

export function CustomInstallationShopifyTab({code}: Props) {
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
                    Then under <b>Theme actions</b>, click on <b>Edit Code</b>
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
            <Alert type={AlertType.Warning}>
                Please note that by copying the code to your Shopify{' '}
                <b>theme.liquid</b> files, the chat will also be shown on all
                webpages. Make sure to copy the code to just specific pages if
                needed.
            </Alert>
            <CodeSnippet code={code} />
        </div>
    )
}

export default CustomInstallationShopifyTab
