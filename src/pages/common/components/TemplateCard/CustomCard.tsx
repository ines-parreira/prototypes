import React, {ComponentProps} from 'react'

import BaseCard from './BaseCard'

function CustomCard(props: ComponentProps<typeof BaseCard>) {
    return (
        <BaseCard
            icon={<i className="material-icons">add_circle</i>}
            {...props}
        />
    )
}

export default CustomCard
