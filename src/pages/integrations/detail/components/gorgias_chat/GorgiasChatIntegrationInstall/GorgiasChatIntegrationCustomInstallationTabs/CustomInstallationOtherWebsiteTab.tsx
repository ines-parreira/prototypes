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
                    Localize in the source files of your website in which file
                    is the tag <b>&#x3C;/body&#x3E;</b> and open it
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
                Please note that by copying the code here, the chat could be
                shown on all webpages. Make sure to copy the code to just
                specific pages if needed.
            </Alert>
            <CodeSnippet code={code} />
        </div>
    )
}

export default CustomInstallationOtherWebsiteTab
