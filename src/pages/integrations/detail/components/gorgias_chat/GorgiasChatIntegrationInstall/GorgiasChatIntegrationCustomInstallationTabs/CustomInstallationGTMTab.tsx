import React from 'react'

import css from './CustomInstallationTabs.less'

type Props = {
    code: string
}

export function CustomInstallationGTMTab({code}: Props) {
    const applicationIdRe = /applicationId=(\d+)/
    const result = applicationIdRe.exec(code)
    const applicationId = result?.[1]
    return (
        <div className={css['wrapper']}>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>1</span>
                </div>
                <div className={css['instruction-text']}>
                    In Google Tag Manager, click "Tags" in the menu.
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>2</span>
                </div>
                <div className={css['instruction-text']}>
                    <b>Click "New" to create a new tag.</b>
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>3</span>
                </div>
                <div className={css['instruction-text']}>
                    Search for "Gorgias Chat" and select it.
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>4</span>
                </div>
                <div className={css['instruction-text']}>
                    <b>Enter your</b> Gorgias Chat App ID : {applicationId}
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>5</span>
                </div>
                <div className={css['instruction-text']}>
                    Select "All Pages - Page view" in the Trigger section.
                </div>
            </div>
            <div className={css['instruction']}>
                <div>
                    <span className={css['instruction-number']}>6</span>
                </div>
                <div className={css['instruction-text']}>Save and publish.</div>
            </div>
        </div>
    )
}

export default CustomInstallationGTMTab
