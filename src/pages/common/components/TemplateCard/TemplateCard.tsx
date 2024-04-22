import React, {ComponentProps} from 'react'

import BaseCard from './BaseCard'
import css from './Card.less'

function TemplateCard(props: ComponentProps<typeof BaseCard>) {
    return <BaseCard className={css.templateCard} {...props} />
}

export default TemplateCard
