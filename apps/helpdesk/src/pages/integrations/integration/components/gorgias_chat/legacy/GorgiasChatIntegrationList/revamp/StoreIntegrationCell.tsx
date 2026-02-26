import type { MouseEvent } from 'react'

import { history } from '@repo/routing'
import type { Map } from 'immutable'

import {
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Color,
    Icon,
    IconName,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { Tab } from 'pages/integrations/integration/types'
import { getStoreIconNameFromType } from 'state/integrations/helpers'

import css from './StoreIntegrationCell.less'

type StoreIntegrationCellProps = {
    chat: Map<any, any>
    storeIntegration: Map<any, any> | undefined
}

const Wrapper = ({ children }: { children: JSX.Element }) => {
    return <div className={css.storeIntegrationCell}>{children}</div>
}

export function StoreIntegrationCell({
    storeIntegration,
    chat,
}: StoreIntegrationCellProps) {
    const installationLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${chat.get('id')}/${Tab.Installation}`
    const isStoreDisconnected = Boolean(
        storeIntegration?.get('deactivated_datetime'),
    )

    const handleConnectButtonClick = (e: MouseEvent) => {
        e.stopPropagation()

        history.push(installationLink)
    }

    if (!storeIntegration) {
        return (
            <Wrapper>
                <Button
                    onClick={handleConnectButtonClick}
                    variant={ButtonVariant.Secondary}
                    intent={ButtonIntent.Regular}
                    size={ButtonSize.Sm}
                >
                    Connect store
                </Button>
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <>
                <Icon
                    name={getStoreIconNameFromType(
                        storeIntegration.get('type'),
                    )}
                ></Icon>
                <Text size="md" variant="medium">
                    {storeIntegration.get('name')}
                </Text>
                {isStoreDisconnected && (
                    <Tooltip delay={100} placement="top">
                        <TooltipTrigger>
                            <span role="img">
                                <Icon
                                    color={Color.Orange}
                                    name={IconName.TriangleWarning}
                                ></Icon>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <Text size="md" variant="medium">
                                This store is currently disconnected
                            </Text>
                        </TooltipContent>
                    </Tooltip>
                )}
            </>
        </Wrapper>
    )
}
