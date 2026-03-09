import type { ComponentProps } from 'react'
import React from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { EntityType } from 'hooks/useSearchRankScenario'
import SpotlightRow from 'pages/common/components/Spotlight/SpotlightRow'

const storyConfig: Meta = {
    title: 'General/SpotlightRow',
    component: SpotlightRow,
}

const defaultProps: ComponentProps<typeof SpotlightRow> = {
    title: 'someTitle',
    info: 'some info',
    link: 'http://abc.xyz',
    onCloseModal: () => alert('close!'),
    id: 123,
    index: 0,
    entityType: EntityType.Ticket,
}

const Template: StoryFn<ComponentProps<typeof SpotlightRow>> = (props) => (
    <MemoryRouter>
        <SpotlightRow {...props} />
    </MemoryRouter>
)

export const Default = Template.bind(defaultProps)
Default.args = defaultProps

export const WithHighlights = Template.bind({})
WithHighlights.args = {
    ...defaultProps,
    title: 'Some <em>highlights</em> in the title',
    info: (
        <>
            <em>highlights</em> in the info
        </>
    ),
}

export default storyConfig
