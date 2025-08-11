import { useHistory } from 'react-router-dom'

import { Badge } from '@gorgias/axiom'

import Button from 'pages/common/components/button/Button'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import { assetsUrl } from 'utils'

import css from './AILibraryBanner.less'

const AILibraryBanner = () => {
    const helpCenterId = useHelpCenterIdParam()
    const history = useHistory()

    return (
        <div className={css.container}>
            <div className={css.wrapper}>
                <div className={css.bannerContent}>
                    <Badge type={'magenta'} className={css.badge}>
                        <i className="material-icons">auto_awesome</i>ai powered
                    </Badge>
                    <div className={css.bannerTitle}>
                        Get started with AI generated articles just for you
                    </div>
                    <div className={css.bannerDescription}>
                        {`We used AI to generate pre-written articles based on
                        your customer's most frequently asked questions.`}
                    </div>
                    <a
                        className={css.actionButton}
                        onClick={() => {
                            history.push(
                                `/app/settings/help-center/${helpCenterId}/ai-library`,
                                {
                                    from: 'no-articles-banner',
                                },
                            )
                        }}
                    >
                        <Button intent="primary">Review Articles</Button>
                    </a>
                </div>
                <img
                    src={assetsUrl(`/img/help-center/ai-library-template.png`)}
                    alt="Flows Banner"
                    className={css.image}
                />
            </div>
        </div>
    )
}

export default AILibraryBanner
