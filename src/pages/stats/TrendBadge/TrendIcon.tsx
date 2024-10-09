import React from 'react'
import {getIconNameBySign} from 'pages/stats/utils'

export const TrenIcon = ({sign}: {sign: number}) => {
    return !!sign ? (
        <i className="material-icons-round mr-1 icon" style={{fontSize: 12}}>
            {getIconNameBySign(sign)}
        </i>
    ) : null
}
