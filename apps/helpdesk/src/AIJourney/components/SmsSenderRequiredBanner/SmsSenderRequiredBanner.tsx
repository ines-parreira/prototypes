import { useHistory } from 'react-router-dom'

import { Banner, Link } from '@gorgias/axiom'

type Props = {
    settingsUrl: string
    isCampaign?: boolean
}

export const SmsSenderRequiredBanner = ({ settingsUrl, isCampaign }: Props) => {
    const history = useHistory()
    const entity = isCampaign ? 'campaign' : 'flow'

    return (
        <Banner
            intent="warning"
            icon="triangle-warning"
            isClosable={false}
            title="Add sender phone number to activate"
            description={`Select a phone number in Settings before this ${entity} can go live.`}
            size="md"
        >
            <Link
                size="sm"
                trailingSlot="external-link"
                onClick={() => history.push(settingsUrl)}
            >
                Go to Settings
            </Link>
        </Banner>
    )
}
