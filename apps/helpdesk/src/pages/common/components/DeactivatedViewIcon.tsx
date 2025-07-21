import classNames from 'classnames'
import { UncontrolledTooltip } from 'reactstrap'

import css from './DeactivatedViewIcon.less'

type Props = {
    id: string
    tooltipText?: string
}

export default function DeactivatedViewIcon({ id, tooltipText }: Props) {
    return (
        <>
            <span id={id}>
                <i
                    className={classNames(
                        'material-icons text-danger',
                        css.deactivated,
                    )}
                >
                    error
                </i>
            </span>
            {tooltipText && (
                <UncontrolledTooltip placement="top" target={id}>
                    {tooltipText}
                </UncontrolledTooltip>
            )}
        </>
    )
}
