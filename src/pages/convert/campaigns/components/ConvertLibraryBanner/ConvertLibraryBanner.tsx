import { Link } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import { assetsUrl } from 'utils'

import css from './ConvertLibraryBanner.less'

type Props = {
    integrationId: number
}

const ConvertLibraryBanner = ({ integrationId }: Props) => {
    return (
        <div className={css.container}>
            <div className={css.bannerContent}>
                <div className={css.leftContent}>
                    <h3 className={css.title}>
                        Get started faster with campaign templates
                    </h3>
                    <p className={css.content}>
                        Discover the campaign strategy used by best-in-class
                        Convert customers, customize the campaign templates, and
                        push them live to your store in a click!
                    </p>
                    <div>
                        <Link
                            to={`/app/convert/${integrationId}/campaigns/library`}
                        >
                            <Button>View campaign library</Button>
                        </Link>
                    </div>
                </div>
                <div className={css.preview}>
                    <img
                        src={assetsUrl(
                            '/img/presentationals/convert-templates-banner.png',
                        )}
                        alt="Convert campaign library preview"
                    />
                </div>
            </div>
        </div>
    )
}

export default ConvertLibraryBanner
