import React, { ReactNode, useContext } from 'react'

import { EditionContext } from 'providers/infobar/EditionContext'

import UIStaticField from './views/StaticField'

type Props = {
    children: ReactNode
    label?: ReactNode
    isNotBold?: boolean
}

export default function StaticField(props: Props) {
    const { isEditing } = useContext(EditionContext)
    return <UIStaticField {...props} isDisabled={isEditing} />
}
