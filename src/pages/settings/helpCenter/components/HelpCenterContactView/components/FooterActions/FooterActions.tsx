import React from 'react'
import Button from 'pages/common/components/button/Button'

import {useHelpCenterTranslation} from '../../../../providers/HelpCenterTranslation'

const FooterActions: React.FC = () => {
    const {updateHelpCenter, resetTranslation} = useHelpCenterTranslation()

    return (
        <footer>
            <Button onClick={updateHelpCenter}>Save Changes</Button>
            <Button
                className="ml-2"
                intent="secondary"
                onClick={resetTranslation}
            >
                Cancel
            </Button>
        </footer>
    )
}

export default FooterActions
