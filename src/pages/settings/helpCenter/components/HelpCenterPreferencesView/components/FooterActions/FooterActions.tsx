import React from 'react'
import {Button} from 'reactstrap'

import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

export const FooterActions: React.FC = () => {
    const {savePreferences, resetPreferences, canSavePreferences} =
        useHelpCenterPreferencesSettings()

    return (
        <footer>
            <Button
                color="success"
                disabled={!canSavePreferences}
                onClick={savePreferences}
            >
                Save Changes
            </Button>
            <Button className="ml-2" onClick={resetPreferences}>
                Cancel
            </Button>
        </footer>
    )
}
