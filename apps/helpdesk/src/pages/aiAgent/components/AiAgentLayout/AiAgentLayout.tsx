import { ReactNode, useMemo } from 'react'

import classnames from 'classnames'

import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentView } from '../AiAgentView/AiAgentView'
import { useAiAgentHeaderNavbarItems } from './useAiAgentHeaderNavbarItems'

import css from './AiAgentLayout.less'

type Props = {
    children?: ReactNode
    shopName: string
    className?: string
    title: ReactNode
    isLoading?: boolean
    // Hide title and navbar (eg: to show a paywall)
    fullscreen?: boolean
    titleChildren?: ReactNode
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
    fullscreen,
    titleChildren,
}: Props) => {
    const headerNavbarItems = useAiAgentHeaderNavbarItems(shopName)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const atLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()

    const { storeActivations } = useStoreActivations()

    const { canStartTrial, canStartTrialFromFeatureFlag } =
        useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess: () => {},
        })

    const { activationModal, earlyAccessModal } = useActivation({
        autoDisplayEarlyAccessDisabled:
            atLeastOneStoreHasActiveTrial ||
            canStartTrial ||
            canStartTrialFromFeatureFlag,
    })

    const AiAgentTitle = useMemo(() => {
        return (
            <div className={css.customAiAgentTitle}>
                <div className={css.customAiAgentTitleSubContainer}>
                    <h1 className="d-flex align-items-center">{title}</h1>
                </div>
                {titleChildren}
            </div>
        )
    }, [title, titleChildren])

    return (
        <AiAgentView
            isLoading={isLoading}
            title={!fullscreen ? AiAgentTitle : undefined}
            headerNavbarItems={!fullscreen ? headerNavbarItems : undefined}
            className={classnames(css.container, className)}
        >
            {children}
            {activationModal}
            {earlyAccessModal}
        </AiAgentView>
    )
}
