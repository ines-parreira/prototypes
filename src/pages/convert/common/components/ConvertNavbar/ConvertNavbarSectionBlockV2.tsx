import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import useCanAddContactFormFlag from 'pages/convert/common/hooks/useContactFormFlag'

import css from './ConvertNavbarSectionBlockV2.less'

type ConvertNavbarSectionBlockV2Props = {
    chatIntegrationId: number
    name: string
    isOnboarded: boolean
    hasStore: boolean
}
const FROM_LOCATION = 'convert-left-menu'

export const ConvertNavbarSectionBlockV2 = ({
    chatIntegrationId,
    isOnboarded,
    hasStore,
    name,
}: ConvertNavbarSectionBlockV2Props) => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const settingsEnabled = useCanAddContactFormFlag()

    if (!isOnboarded) {
        return (
            <Navigation.Section value={chatIntegrationId}>
                <Navigation.SectionTrigger>
                    <span className={css.name}>{name}</span>
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Navigation.SectionContent>
                    <Navigation.SectionItem
                        as={NavLink}
                        displayType="indent"
                        to={{
                            pathname: `/app/convert/${chatIntegrationId}/setup`,
                            state: { from: FROM_LOCATION },
                        }}
                    >
                        Set up
                    </Navigation.SectionItem>
                </Navigation.SectionContent>
            </Navigation.Section>
        )
    }

    return (
        <Navigation.Section value={chatIntegrationId}>
            <Navigation.SectionTrigger>
                <span className={css.name}>{name}</span>
                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            <Navigation.SectionContent>
                {hasStore &&
                    (isConvertSubscriber ? (
                        <Navigation.SectionItem
                            as={NavLink}
                            displayType="indent"
                            to={{
                                pathname: `/app/convert/${chatIntegrationId}/performance`,
                                state: { from: FROM_LOCATION },
                            }}
                        >
                            Performance
                        </Navigation.SectionItem>
                    ) : (
                        <Navigation.SectionItem
                            displayType="indent"
                            as={NavLink}
                            to={`/app/convert/${chatIntegrationId}/performance/subscribe`}
                            className={css.item}
                        >
                            Performance
                            <ConvertNavbarSubscribeIcon />
                        </Navigation.SectionItem>
                    ))}
                <Navigation.SectionItem
                    displayType="indent"
                    as={NavLink}
                    to={{
                        pathname: `/app/convert/${chatIntegrationId}/campaigns`,
                        state: { from: FROM_LOCATION },
                    }}
                >
                    Campaigns
                </Navigation.SectionItem>
                {isConvertSubscriber ? (
                    <Navigation.SectionItem
                        displayType="indent"
                        as={NavLink}
                        to={{
                            pathname: `/app/convert/${chatIntegrationId}/click-tracking`,
                            state: { from: FROM_LOCATION },
                        }}
                    >
                        Click tracking
                    </Navigation.SectionItem>
                ) : (
                    <Navigation.SectionItem
                        displayType="indent"
                        as={NavLink}
                        to={`/app/convert/${chatIntegrationId}/click-tracking/subscribe`}
                        className={css.item}
                    >
                        Click tracking
                        <ConvertNavbarSubscribeIcon />
                    </Navigation.SectionItem>
                )}
                {settingsEnabled ? (
                    <Navigation.SectionItem
                        displayType="indent"
                        as={NavLink}
                        to={{
                            pathname: `/app/convert/${chatIntegrationId}/settings`,
                            state: { from: FROM_LOCATION },
                        }}
                    >
                        Settings
                    </Navigation.SectionItem>
                ) : (
                    <Navigation.SectionItem
                        displayType="indent"
                        as={NavLink}
                        to={{
                            pathname: `/app/convert/${chatIntegrationId}/installation`,
                            state: { from: FROM_LOCATION },
                        }}
                    >
                        Installation
                    </Navigation.SectionItem>
                )}
            </Navigation.SectionContent>
        </Navigation.Section>
    )
}

function ConvertNavbarSubscribeIcon() {
    return (
        <i className={classNames('material-icons', css.icon)}>
            arrow_circle_up
        </i>
    )
}
