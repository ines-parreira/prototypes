import React from 'react'
import {Button} from 'reactstrap'

import {useLanguagePreferencesSettings} from '../../../../providers/LanguagePreferencesSettings'

export const FooterActions = () => {
    const {
        savePreferences,
        resetPreferences,
        arePreferencesChanged,
    } = useLanguagePreferencesSettings()
    const $ref = React.createRef<HTMLElement>()

    return (
        <footer style={{marginTop: 64, display: 'inline-flex'}} ref={$ref}>
            <Button
                color="success"
                disabled={!arePreferencesChanged()}
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
