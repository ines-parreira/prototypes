import { ChatApplicationAutomationSettings } from '../../../../models/chatApplicationAutomationSettings/types'
import {
    chatApplicationAutomationSettingsFetched,
    chatApplicationAutomationSettingsUpdated,
    chatsApplicationAutomationSettingsFetched,
} from '../actions'
import reducer from '../reducer'

const applicationAutomationSettings1: ChatApplicationAutomationSettings = {
    id: 1,
    applicationId: 10,
    articleRecommendation: { enabled: true },
    orderManagement: { enabled: true },
    workflows: { enabled: true },
    createdDatetime: '2022-10-08T09:01:01.054322+00:00',
    updatedDatetime: '2022-10-08T09:01:01.054322+00:00',
}

const applicationAutomationSettings2: ChatApplicationAutomationSettings = {
    id: 2,
    applicationId: 15,
    articleRecommendation: { enabled: false },
    orderManagement: { enabled: false },
    workflows: { enabled: false },
    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
}

describe('chatsApplicationAutomationSettings reducers', () => {
    describe('chatsApplicationAutomationSettingsFetched action', () => {
        it('merges fetched data with the state', () => {
            const state = reducer(
                {},
                chatsApplicationAutomationSettingsFetched([
                    applicationAutomationSettings1,
                    applicationAutomationSettings2,
                ]),
            )

            expect(state).toEqual({
                '10': expect.objectContaining({
                    applicationId: 10,
                    id: 1,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    workflows: {
                        enabled: true,
                    },
                }),
                '15': expect.objectContaining({
                    applicationId: 15,
                    id: 2,
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    workflows: {
                        enabled: false,
                    },
                }),
            })
        })
    })

    describe('chatApplicationAutomationSettingsFetched action', () => {
        it('adds the fetched data to the state', () => {
            const state = reducer(
                {
                    [applicationAutomationSettings1.applicationId.toString()]:
                        applicationAutomationSettings1,
                },
                chatApplicationAutomationSettingsFetched(
                    applicationAutomationSettings2,
                ),
            )

            expect(state).toEqual({
                '10': expect.objectContaining({
                    applicationId: 10,
                    id: 1,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    workflows: {
                        enabled: true,
                    },
                }),
                '15': expect.objectContaining({
                    applicationId: 15,
                    id: 2,
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    workflows: {
                        enabled: false,
                    },
                }),
            })
        })
    })

    describe('chatApplicationAutomationSettingsUpdated action', () => {
        it('updates existing application Automate settings in the state', () => {
            const state = reducer(
                {
                    [applicationAutomationSettings1.applicationId.toString()]:
                        applicationAutomationSettings1,
                    [applicationAutomationSettings2.applicationId.toString()]:
                        applicationAutomationSettings2,
                },
                chatApplicationAutomationSettingsUpdated({
                    ...applicationAutomationSettings2,
                    orderManagement: { enabled: true },
                    updatedDatetime: '2023-03-01T11:10:05.000987+00:00',
                }),
            )

            expect(state).toEqual({
                '10': expect.objectContaining({
                    applicationId: 10,
                    id: 1,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    workflows: {
                        enabled: true,
                    },
                }),
                '15': expect.objectContaining({
                    applicationId: 15,
                    id: 2,
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    workflows: {
                        enabled: false,
                    },
                }),
            })
        })

        it('adds new application Automate settings in the state', () => {
            const state = reducer(
                {
                    [applicationAutomationSettings1.applicationId.toString()]:
                        applicationAutomationSettings1,
                },
                chatApplicationAutomationSettingsUpdated(
                    applicationAutomationSettings2,
                ),
            )

            expect(state).toEqual({
                '10': expect.objectContaining({
                    applicationId: 10,
                    id: 1,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    workflows: {
                        enabled: true,
                    },
                }),
                '15': expect.objectContaining({
                    applicationId: 15,
                    id: 2,
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    workflows: {
                        enabled: false,
                    },
                }),
            })
        })
    })
})
