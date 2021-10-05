import React from 'react'
import {Alert} from 'reactstrap'

import CodeSnippet from '../../../../../../common/components/CodeSnippet'

import css from './CustomInstallationTabs.less'

type Props = {
    code: string
}

export function CustomInstallationOtherWebsiteTab({code}: Props) {
    return (
        <div className={css['wrapper']}>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>1</span>
                </div>
                <div className={css['instruction-text']}>
                    Edit the source code of your website which contains the
                    closing HTML tag <b>&#x3C;/body&#x3E;</b>
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>2</span>
                </div>
                <div className={css['instruction-text']}>
                    Just above this tag, copy and paste the code snippet below
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>3</span>
                </div>
                <div className={css['instruction-text']}>
                    Save the file and commit the changes
                </div>
            </div>
            <Alert color="warning">
                Please note that by inserting this snippet on your webpage, it
                will load the chat on that specific webpage only. Make sure to
                insert the snippet on all the pages for which you wish to
                display the chat widget.
            </Alert>
            <CodeSnippet code={code} />
        </div>
    )
}

export default CustomInstallationOtherWebsiteTab
