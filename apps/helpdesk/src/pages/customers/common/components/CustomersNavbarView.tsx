import { useState } from 'react'

import { useViewCount } from '@repo/views'
import type { Map } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import type { UserSettingType } from 'config/types/user'
import type { ViewType } from 'models/view/types'
import { DefaultExportViewCount as ViewCount } from 'pages/common/components/ViewCount/ViewCount'
import { DefaultExportViewName as ViewName } from 'pages/common/components/ViewName/ViewName'
import type { RootState } from 'state/types'
import { makeGetViewsByType } from 'state/views/selectors'
import { getPluralObjectName } from 'utils'

import css from './CustomersNavbarView.less'

const connector = connect((state: RootState, props: OwnProps) => {
    const getViewsByType = makeGetViewsByType()
    return {
        views: getViewsByType(state, props.viewType),
    }
})

type OwnProps = {
    viewType: ViewType
    settingType: UserSettingType
    isLoading: boolean
}

type CustomersNavbarViewV2Props = OwnProps & ConnectedProps<typeof connector>

function CustomerViewNavItem({
    view,
    viewType,
}: {
    view: Map<string, any>
    viewType: ViewType
}) {
    const viewId = view.get('id')
    const viewCount = useViewCount(viewId)

    return (
        <Navigation.SectionItem
            as={Link}
            to={`/app/${getPluralObjectName(viewType)}/${viewId}/${view.get('slug')}`}
            key={viewId}
            className={css.navigationSectionItem}
            isSelected={true}
            displayType="indent"
        >
            <ViewName viewName={view.get('name')} />
            <ViewCount
                viewCount={viewCount}
                viewId={viewId}
                isDeactivated={false}
                objectName={getPluralObjectName(viewType)}
            />
        </Navigation.SectionItem>
    )
}

export const CustomersNavbarView = connector(function CustomersNavbarViewV2({
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
                        <CustomerViewNavItem
                            key={view.get('id')}
                            view={view}
                            viewType={viewType}
                        />
                    ))}
                </Navigation.SectionContent>
            </Navigation.Section>
        </Navigation.Root>
    )
})
