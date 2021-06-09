// @flow
import * as React from 'react'

export type Option = {
    label: string,
    displayLabel?: React.Node,
    isDeprecated?: boolean,
    value: any,
}
