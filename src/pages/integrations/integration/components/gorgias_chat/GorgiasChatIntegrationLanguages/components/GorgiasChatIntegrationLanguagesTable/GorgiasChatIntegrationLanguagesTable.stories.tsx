import React from 'react'
import {Meta, Story} from '@storybook/react'
import {BrowserRouter} from 'react-router-dom'

import {Language} from 'constants/languages'

import {
    GorgiasChatIntegrationLanguagesTable,
    GorgiasChatIntegrationLanguagesTableProps,
} from './GorgiasChatIntegrationLanguagesTable'
import {GorgiasChatIntegrationLanguagesTableRow} from './GorgiasChatIntegrationLanguagesTableRow'
import {useGorgiasChatIntegrationLanguagesTable} from './useGorgiasChatIntegrationLanguagesTable'

const GorgiasChatIntegrationLanguagesTableContainer = () => {
    const {languagesRows} = useGorgiasChatIntegrationLanguagesTable({
        integrationId: 1,
        languages: [
            {
                language: Language.EnglishUs,
                primary: true,
            },
            {
                language: Language.Spanish,
                primary: false,
            },
            {
                language: Language.German,
                primary: false,
            },
        ],
    })

    return (
        <>
            {languagesRows.map((languageRow) => (
                <GorgiasChatIntegrationLanguagesTableRow
                    key={languageRow.language}
                    language={languageRow}
                    onClickSetAsDefault={(lang) => {
                        alert(`Set '${lang.language}' as default`)
                    }}
                    onClickDelete={(lang) => {
                        alert(`Delete '${lang.language}'`)
                    }}
                />
            ))}
        </>
    )
}

const storyConfig: Meta = {
    argTypes: {},
    component: GorgiasChatIntegrationLanguagesTable,
    decorators: [(story) => <BrowserRouter>{story()}</BrowserRouter>],
    title: 'Chat/LanguagesTable',
}

const Template: Story<GorgiasChatIntegrationLanguagesTableProps> = (props) => (
    <GorgiasChatIntegrationLanguagesTable {...props} />
)

const defaultProps: Partial<GorgiasChatIntegrationLanguagesTableProps> = {
    children: <GorgiasChatIntegrationLanguagesTableContainer />,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
