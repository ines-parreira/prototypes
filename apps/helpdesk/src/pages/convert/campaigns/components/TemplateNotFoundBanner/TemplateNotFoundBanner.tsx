import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import css from './TemplateNotFoundBanner.less'

type OwnProps = {
    integrationId: number
}

const TemplateNotFoundBanner = ({ integrationId }: OwnProps) => {
    return (
        <div className={css.container}>
            <div className={css.center}>
                <h3 className={css.title}>
                    Can’t find what you’re looking for?
                </h3>
                <p className={css.description}>
                    Create a campaign from scratch to fit your strategy.
                </p>
                <Link to={`/app/convert/${integrationId}/campaigns/new`}>
                    <Button>Create custom Campaign</Button>
                </Link>
            </div>
        </div>
    )
}

export default TemplateNotFoundBanner
