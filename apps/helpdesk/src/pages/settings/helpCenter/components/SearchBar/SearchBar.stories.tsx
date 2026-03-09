import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { getSingleHelpCenterResponseFixture as helpCenter } from '../../fixtures/getHelpCentersResponse.fixture'
import {
    SearchContextProvider,
    useSearchContext,
} from '../../providers/SearchContext'
import { SearchBar } from './SearchBar'

const storyConfig: Meta = {
    title: 'Help center/SearchBar',
    component: SearchBar,
    argTypes: {},
}

type TemplateProps = ComponentProps<typeof SearchBar> & {
    algolia_api_key: string
    algolia_app_id: string
    algolia_index_name: string
}

const DumpResultsComponent = () => {
    const { searchResults } = useSearchContext()

    const colorsByState = {
        loading: '#f7d15d',
        ready: 'green',
        error: 'red',
    }

    const color = searchResults ? colorsByState[searchResults.state] : 'gray'

    return (
        <div
            style={{
                border: `1px solid ${color}`,
                margin: '24px',
                padding: '16px',
            }}
        >
            <h2>(debugging) content of the SearchContext</h2>

            <p style={{ color }}>
                {searchResults ? (
                    <pre>{JSON.stringify(searchResults, null, 4)}</pre>
                ) : (
                    'Input your search query and make sure you have set correct values for algolia_api_key, algolia_app_id and algolia_index_name'
                )}
            </p>
        </div>
    )
}

type Story = StoryObj<TemplateProps>

const DefaultTemplate: Story = {
    render: ({
        algolia_api_key,
        algolia_app_id,
        algolia_index_name,
        ...rest
    }) => (
        <SearchContextProvider
            helpCenter={{
                ...helpCenter,
                algolia_api_key,
                algolia_app_id,
                algolia_index_name,
            }}
        >
            <SearchBar {...rest} />

            <DumpResultsComponent />
        </SearchContextProvider>
    ),
}

export const Default = {
    ...DefaultTemplate,
    args: {
        algolia_api_key: 'my-api-key',
        algolia_app_id: 'my-app-id',
        algolia_index_name: 'my-index',
    },
}

export default storyConfig
