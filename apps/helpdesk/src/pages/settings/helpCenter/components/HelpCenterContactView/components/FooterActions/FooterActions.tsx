import { Button } from '@gorgias/axiom'

import { useHelpCenterTranslation } from '../../../../providers/HelpCenterTranslation'

const FooterActions: React.FC = () => {
    const { updateHelpCenter, reset } = useHelpCenterTranslation()

    return (
        <footer>
            <Button onClick={updateHelpCenter}>Save Changes</Button>
            <Button className="ml-2" intent="secondary" onClick={reset}>
                Cancel
            </Button>
        </footer>
    )
}

export default FooterActions
