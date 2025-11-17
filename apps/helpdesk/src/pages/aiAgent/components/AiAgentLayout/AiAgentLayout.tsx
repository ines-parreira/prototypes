import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import classnames from 'classnames'

import { Button } from '@gorgias/axiom'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { useFlag } from 'core/flags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useDisplayPlaygroundButtonInLayoutHeader } from 'pages/aiAgent/components/AiAgentLayout/usePlaygroundButtonInLayoutHeader'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
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
    fullscreen?: boolean
    titleChildren?: ReactNode
    hideSaveAndTest?: boolean
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
    const isPlaygroundAvailableEverywhere = useFlag<boolean>(
        FeatureFlagKey.MakePlaygroundAvailableEverywhere,
        false,
    )

    const headerNavbarItems = useAiAgentHeaderNavbarItems(shopName)
    const { togglePlayground, isPlaygroundOpen } = usePlaygroundPanel()

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
    const displayPlaygroundButtonInLayoutHeader =
        useDisplayPlaygroundButtonInLayoutHeader({
            shopName,
            shopType: SHOPIFY_INTEGRATION_TYPE,
        })

    const { setIsCollapsibleColumnOpen } = useCollapsibleColumn()

    useEffectOnce(() => {
        setIsCollapsibleColumnOpen(false)
    })

    const AiAgentTitle = useMemo(() => {
        return (
            <div className={css.customAiAgentTitle}>
                <div className={css.customAiAgentTitleSubContainer}>
                    <h1 className="d-flex align-items-center">{title}</h1>
                </div>
                <div className={css.testButtonContainer}>
                    {titleChildren}
                    {isPlaygroundAvailableEverywhere &&
                        displayPlaygroundButtonInLayoutHeader &&
                        !isPlaygroundOpen && (
                            <Button
                                onClick={togglePlayground}
                                variant="secondary"
                            >
                                Test
                            </Button>
                        )}
                </div>
            </div>
        )
    }, [
        title,
        titleChildren,
        displayPlaygroundButtonInLayoutHeader,
        isPlaygroundOpen,
        isPlaygroundAvailableEverywhere,
        togglePlayground,
    ])

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
