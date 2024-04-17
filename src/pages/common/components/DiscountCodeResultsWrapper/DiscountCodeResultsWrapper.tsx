import React, {useState} from 'react'
import {Map} from 'immutable'
import {DiscountCode} from 'models/discountCodes/types'
import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'
import {useToolbarContext} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import DiscountCodeResults from '../DiscountCodeResults/DiscountCodeResults'
import TabNavigator from '../TabNavigator/TabNavigator'
import UniqueDiscountCodeResults from '../UniqueDiscountOfferResults/UniqueDiscountOfferResults'

enum DiscountCodesTabs {
    Generic = 'generic',
    Unique = 'unique',
}

const navigatorTabs = [
    {label: 'Generic Codes', value: DiscountCodesTabs.Generic},
    {label: 'Unique Codes Offer', value: DiscountCodesTabs.Unique},
]

export type DiscountResultsBaseProps<T> = {
    integration: Map<string, string>
    onDiscountClicked: (
        event: React.MouseEvent<HTMLElement>,
        discount: T
    ) => void
    onResetStoreChoice?: () => void
}

export type DiscountCodeResultsWrapperProps = DiscountResultsBaseProps<
    DiscountCode | UniqueDiscountOffer
>

export const DiscountCodeResultsWrapper: React.FC<DiscountCodeResultsWrapperProps> =
    (props: DiscountCodeResultsWrapperProps) => {
        const {canAddUniqueDiscountOffer} = useToolbarContext()

        const [activeTab, setActiveTab] = useState(DiscountCodesTabs.Generic)

        if (!canAddUniqueDiscountOffer) {
            return <DiscountCodeResults {...props} />
        }

        return (
            <div>
                <TabNavigator
                    tabs={navigatorTabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab as (t: string) => void}
                />
                {activeTab === DiscountCodesTabs.Generic ? (
                    <DiscountCodeResults {...props} />
                ) : (
                    <UniqueDiscountCodeResults {...props} />
                )}
            </div>
        )
    }
