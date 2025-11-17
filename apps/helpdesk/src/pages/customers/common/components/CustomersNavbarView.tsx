import { useState } from 'react'

import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import type { UserSettingType } from 'config/types/user'
import type { ViewType } from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import type { RootState } from 'state/types'
import { makeGetViewCount, makeGetViewsByType } from 'state/views/selectors'
import { getPluralObjectName } from 'utils'

import css from './CustomersNavbarView.less'

const connector = connect((state: RootState, props: OwnProps) => {
    const getViewsByType = makeGetViewsByType()
    return {
        getViewCount: makeGetViewCount(state),
        views: getViewsByType(state, props.viewType),
    }
})

type OwnProps = {
    viewType: ViewType
    settingType: UserSettingType
    isLoading: boolean
}

type CustomersNavbarViewV2Props = OwnProps & ConnectedProps<typeof connector>

export const CustomersNavbarView = connector(function CustomersNavbarViewV2({
    getViewCount,
    views,
    viewType,
}: CustomersNavbarViewV2Props) {
    const [activeViews, setActiveViews] = useState<AccordionValues>(['views'])
    const arrayViews = views.toArray()

    return (
        <Navigation.Root
            className={css.navigation}
            value={activeViews}
            onValueChange={(value) => setActiveViews(value)}
        >
            <Navigation.Section value={activeViews[0]}>
                <Navigation.SectionTrigger>
                    Views
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Navigation.SectionContent>
                    {arrayViews.map((view) => (
                        <Navigation.SectionItem
                            as={Link}
                            to={`/app/${getPluralObjectName(viewType)}/${view.get('id')}/${view.get('slug')}`}
                            key={view.get('id')}
                            className={css.navigationSectionItem}
                            isSelected={true}
                            displayType="indent"
                        >
                            <ViewName viewName={view.get('name')} />
                            <ViewCount
                                viewCount={
                                    getViewCount(view.get('id')) ?? undefined
                                }
                                viewId={view.get('id')}
                                isDeactivated={false}
                                objectName={getPluralObjectName(viewType)}
                            />
                        </Navigation.SectionItem>
                    ))}
                </Navigation.SectionContent>
            </Navigation.Section>
        </Navigation.Root>
    )
})
