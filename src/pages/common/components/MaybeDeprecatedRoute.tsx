import React from 'react'
import {Route} from 'react-router-dom'

import DeprecatedRoute, {DeprecatedRouteProps} from './DeprecatedRoute'

type Props = DeprecatedRouteProps & {
    isDeprecated?: boolean
}

const MaybeDeprecatedRoute = ({isDeprecated = false, ...props}: Props) => {
    if (isDeprecated) {
        return <DeprecatedRoute {...props} />
    }

    return <Route {...props} />
}

export default MaybeDeprecatedRoute
