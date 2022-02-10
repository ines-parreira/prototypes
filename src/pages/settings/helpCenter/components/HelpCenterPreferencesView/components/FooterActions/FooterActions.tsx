import React from 'react'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

export const FooterActions: React.FC = () => {
    const {savePreferences, resetPreferences, canSavePreferences} =
        useHelpCenterPreferencesSettings()

    return (
        <footer>
            <Button
                isDisabled={!canSavePreferences}
                intent={ButtonIntent.Primary}
                type="button"
                onClick={savePreferences}
            >
                Save Changes
            </Button>
            <Button
                className="ml-2"
                intent={ButtonIntent.Secondary}
                type="button"
                onClick={resetPreferences}
            >
                Cancel
            </Button>
        </footer>
    )
}
