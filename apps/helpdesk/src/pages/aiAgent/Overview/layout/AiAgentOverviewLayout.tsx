import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'

import css from './AiAgentOverviewLayout.less'

type Props = {
    children: React.ReactNode
    shopName: string
}
export const AiAgentOverviewLayout = ({ children, shopName }: Props) => {
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
