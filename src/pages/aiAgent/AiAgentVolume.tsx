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
            className={css.container}
            shopName={shopName}
            title={SALES}
        >
            <VolumeSettings />
        </AiAgentLayout>
    )
}
