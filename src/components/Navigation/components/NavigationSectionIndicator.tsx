import classNames from 'classnames'

import { Accordion } from 'components/Accordion/Accordion'

import css from './NavigationSectionIndicator.less'

export function NavigationSectionIndicator() {
    return (
        <Accordion.ItemIndicator>
            <i className={classNames('material-icons', css.indicator)}>
                keyboard_arrow_down
            </i>
        </Accordion.ItemIndicator>
    )
}
