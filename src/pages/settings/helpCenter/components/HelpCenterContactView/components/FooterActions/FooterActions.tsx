import React from 'react'
import {Button} from 'reactstrap'

import {useHelpCenterTranslation} from '../../../../providers/HelpCenterTranslation'

const FooterActions: React.FC = () => {
    const {saveTranslation, resetTranslation} = useHelpCenterTranslation()

    return (
        <footer>
            <Button color="success" onClick={saveTranslation}>
                Save Changes
            </Button>
            <Button className="ml-2" onClick={resetTranslation}>
                Cancel
            </Button>
        </footer>
    )
}

export default FooterActions
