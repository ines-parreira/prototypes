import { ReactNode } from 'react'

import { Link } from 'react-router-dom'

import { useListVoiceQueues } from '@gorgias/api-queries'

import Loader from 'pages/common/components/Loader/Loader'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { PHONE_INTEGRATION_BASE_URL } from './constants'

export default function VoiceQueueListPage() {
    const { data, isLoading, isError } = useListVoiceQueues()

    if (isLoading) {
        return (
            <Wrapper>
                <Loader />
            </Wrapper>
        )
    }

    if (isError) {
        return <Wrapper>Error</Wrapper>
    }

    return (
        <Wrapper>
            {data?.data?.data.map((queue) => (
                <div key={queue.id}>
                    <Link
                        to={`${PHONE_INTEGRATION_BASE_URL}/queues/${queue.id}`}
                    >
                        {queue.name}
                    </Link>
                </div>
            ))}
        </Wrapper>
    )
}

const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
        <SettingsPageContainer>
            <SettingsContent>{children}</SettingsContent>
        </SettingsPageContainer>
    )
}
