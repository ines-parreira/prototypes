import React from 'react'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import {useHelpCenterTranslation} from '../../../../providers/HelpCenterTranslation'

const FooterActions: React.FC = () => {
    const {saveTranslation, resetTranslation} = useHelpCenterTranslation()

    return (
        <footer>
            <Button
                intent={ButtonIntent.Primary}
                type="button"
                onClick={saveTranslation}
            >
                Save Changes
            </Button>
            <Button
                className="ml-2"
                intent={ButtonIntent.Secondary}
                type="button"
                onClick={resetTranslation}
            >
                Cancel
            </Button>
        </footer>
    )
}

export default FooterActions
