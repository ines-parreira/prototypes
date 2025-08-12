import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'

import css from './AiAgentOverviewLayout.less'

type Props = {
    children: React.ReactNode
    shopName?: string
    isActionDrivenAiAgentNavigationEnabled: boolean
}
export const AiAgentOverviewLayout = ({
    children,
    shopName,
    isActionDrivenAiAgentNavigationEnabled,
}: Props) => {
    if (isActionDrivenAiAgentNavigationEnabled && shopName) {
        return (
            <AiAgentLayout
                shopName={shopName}
                className={css.containerActionDriven}
                title={'Overview'}
            >
                {children}
            </AiAgentLayout>
        )
    }

    return (
        <div className={css.container} data-overflow="visible">
            {children}
        </div>
    )
}
