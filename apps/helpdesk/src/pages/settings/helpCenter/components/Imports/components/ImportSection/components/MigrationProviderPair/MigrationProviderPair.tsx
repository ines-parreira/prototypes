import classNames from 'classnames'

import css from './MigrationProviderPair.less'

interface ImgConfig {
    src: string
    alt: string
}

type Props = {
    left: ImgConfig
    right: ImgConfig
}

const MigrationProviderPair: React.FC<Props> = ({ left, right }) => {
    return (
        <div className={css.wrapper}>
            <img src={left.src} alt={left.alt} className={css.image} />
            <i className={classNames(css.arrow, 'material-icons')}>
                arrow_right_alt
            </i>
            <img src={right.src} alt={right.alt} className={css.image} />
        </div>
    )
}

export default MigrationProviderPair
