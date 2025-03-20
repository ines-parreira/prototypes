import React from 'react'

import { useParams } from 'react-router-dom'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { VolumeSettings } from './components/VolumeSettings/VolumeSettings'
import { SALES } from './constants'

import css from './AiAgentVolume.less'

export const AiAgentVolume = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={SALES}
        >
            <VolumeSettings />
        </AiAgentLayout>
    )
}
