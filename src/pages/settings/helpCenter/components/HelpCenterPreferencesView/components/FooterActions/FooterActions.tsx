import React from 'react'

import Button from 'pages/common/components/button/Button'

import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

export const FooterActions: React.FC = () => {
    const {savePreferences, resetPreferences, canSavePreferences} =
        useHelpCenterPreferencesSettings()

    return (
        <footer>
            <Button isDisabled={!canSavePreferences} onClick={savePreferences}>
                Save Changes
            </Button>
            <Button
                className="ml-2"
                intent="secondary"
                onClick={resetPreferences}
            >
                Cancel
            </Button>
        </footer>
    )
}
