import React from 'react'

import Button from 'pages/common/components/button/Button'

import css from './SalesSettings.less'

export const SalesSettings = () => {
    const onSave = () => {
        // TODO add call to hook useStoreConfigurationMutation
    }

    const onCancel = () => {
        // TODO add real action on cancel
    }

    return (
        <>
            <h1 className={css.salesSettingsTitle}>Sales settings</h1>
            <div className={css.salesSettingsContent}>
                Settings here
                <div className={css.contentActions}>
                    <Button onClick={onSave}>Save</Button>
                    <Button intent="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    )
}
