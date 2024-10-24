import classnames from 'classnames'
import React, {ComponentProps} from 'react'

import BaseCard from './BaseCard'
import css from './Card.less'

function TemplateCard(props: ComponentProps<typeof BaseCard>) {
    return (
        <BaseCard
            {...props}
            className={classnames(css.templateCard, props.className)}
        />
    )
}

export default TemplateCard
