import type { Map } from 'immutable'

import { Text, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import { getIconFromType } from 'state/integrations/helpers'

import css from './StoreIntegrationCell.less'

type StoreIntegrationCellProps = {
    storeIntegration: Map<any, any> | undefined
}

export function StoreIntegrationCell({
    storeIntegration,
}: StoreIntegrationCellProps) {
    const isStoreDisconnected = Boolean(
        storeIntegration?.get('deactivated_datetime'),
    )

    const Wrapper = ({ children }: { children: JSX.Element }) => {
        return <div className={css.storeIntegrationCell}>{children}</div>
    }

    if (!storeIntegration) {
        return (
            <Wrapper>
                <Text size="md" variant="medium">
                    No store connected
                </Text>
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <>
                <img
                    height={16}
                    width={16}
                    src={getIconFromType(storeIntegration.get('type'))}
                    alt="logo"
                />
                <Text size="md" variant="medium">
                    {storeIntegration.get('name')}
                </Text>
                {isStoreDisconnected && (
                    <Tooltip delay={100} placement="top">
                        <TooltipTrigger>
                            <img src={warningIcon} alt="warning icon" />
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
