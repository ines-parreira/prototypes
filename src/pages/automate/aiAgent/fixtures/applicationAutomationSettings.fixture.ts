const applicationId = 25

export const applicationAutomationSettingsFixture = {
    id: 110,
    applicationId,
    articleRecommendation: {
        enabled: false,
    },
    orderManagement: {
        enabled: false,
    },
    quickResponses: {
        enabled: true,
    },
    workflows: {
        enabled: true,
        entrypoints: [
            {
                enabled: true,
                workflow_id: '01HZHAN2Z7WBMAPK266DTW0ZWC',
            },
            {
                enabled: true,
                workflow_id: '01HZHASJ8ZN2TEVG0TSTVYXAQX',
            },
            {
                enabled: true,
                workflow_id: '01HNDKMSSAV6MPV125PXB3MMSG',
            },
            {
                enabled: true,
                workflow_id: '01HQQYPGNH1CNBART86FG8PCN6',
            },
            {
                enabled: true,
                workflow_id: '01HQT87MV168MHHENMC1VC55S7',
            },
        ],
    },
    createdDatetime: '2024-06-05T11:27:06.939Z',
    updatedDatetime: '2024-07-30T14:16:39.411Z',
    aiAgent: {
        enabled: false,
    },
}

export const applicationsAutomationSettingsStateFixture = {
    [applicationId]: applicationAutomationSettingsFixture,
}
export const applicationsAutomationSettingsAiAgentEnabledFixture = {
    [applicationId]: {
        ...applicationsAutomationSettingsStateFixture[applicationId],
        aiAgent: {
            enabled: false,
        },
    },
}
