import { useSavedSizes } from '@repo/layout'
import classnames from 'classnames'

import { DEFAULT_WIDTH } from 'pages/common/components/infobar/InfobarLayout'

import css from './PhoneInfobarWrapper.less'

type Props = {
    primary?: boolean
    children: React.ReactNode
}

export default function PhoneInfobarWrapper({
    primary,
    children,
}: Props): JSX.Element {
    const [savedSizes] = useSavedSizes()
    const width = (savedSizes.current.infobar || DEFAULT_WIDTH) + 9

    return (
        <div
            style={{ width: `${width}px` }}
            className={classnames(css.container, { [css.primary]: primary })}
        >
            <div className={css.inner}>{children}</div>
        </div>
    )
}
