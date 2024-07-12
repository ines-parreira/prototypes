import React from 'react'
import {render} from '@testing-library/react'
import {assumeMock} from 'utils/testing'

import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {useGetAICompatibleMacros} from 'models/macro/queries'
import {usePublicResources} from 'pages/automate/aiAgent/hooks/usePublicResources'
import {useGuidanceArticles} from 'pages/automate/aiAgent/hooks/useGuidanceArticles'
import {useGetStoreWorkflowsConfigurations} from 'models/workflows/queries'

import * as useAIAgentGetOtherResources from '../useAIAgentGetOtherResources'

jest.mock('models/helpCenter/queries')
jest.mock('models/macro/queries')
jest.mock('pages/automate/aiAgent/hooks/usePublicResources')
jest.mock('pages/automate/aiAgent/hooks/useGuidanceArticles')
jest.mock('models/workflows/queries')

const mockedUseGetHelpCenterArticleList = assumeMock(
    useGetHelpCenterArticleList
)
const mockedUseGetAICompatibleMacros = assumeMock(useGetAICompatibleMacros)
const mockedUsePublicResources = assumeMock(usePublicResources)
const mockedUseGuidanceArticles = assumeMock(useGuidanceArticles)
const mockedUseGetStoreWorkflowsConfigurations = assumeMock(
    useGetStoreWorkflowsConfigurations
)

const TestComponent = () => {
    const resources = useAIAgentGetOtherResources.useAIAgentGetOtherResources({
        articleHelpCenterId: 1,
        guidanceHelpCenterId: 2,
        snippetHelpCenterId: 3,
        shopName: 'test',
        shopType: 'test',
    })

    return <div>{JSON.stringify(resources)}</div>
}

describe('useAIAgentGetOtherResources', () => {
    describe('when no data is available', () => {
        beforeEach(() => {
            mockedUseGetHelpCenterArticleList.mockReturnValue({
                data: {data: []},
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>)

            mockedUseGetAICompatibleMacros.mockReturnValue({
                data: {pages: [{data: {data: []}}]},
            } as unknown as ReturnType<typeof useGetAICompatibleMacros>)

            mockedUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            } as unknown as ReturnType<typeof usePublicResources>)

            mockedUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: false,
            } as unknown as ReturnType<typeof useGuidanceArticles>)

            mockedUseGetStoreWorkflowsConfigurations.mockReturnValue({
                data: [],
                isLoading: false,
            } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        })

        it('should return empty arrays when no data is available', () => {
            // Arrange

            const spyUseAIAgentGetOtherResources = jest.spyOn(
                useAIAgentGetOtherResources,
                'useAIAgentGetOtherResources'
            )

            // Act

            render(<TestComponent />)

            // Assert

            expect(spyUseAIAgentGetOtherResources).toHaveBeenLastCalledWith({
                articleHelpCenterId: 1,
                guidanceHelpCenterId: 2,
                snippetHelpCenterId: 3,
                shopName: 'test',
                shopType: 'test',
            })

            expect(spyUseAIAgentGetOtherResources).toHaveLastReturnedWith(
                expect.objectContaining({
                    articlesOptions: [],
                    guidanceOptions: [],
                    snippetsOptions: [],
                    macrosOptions: [],
                    actionsOptions: [],
                    isOtherResourceListLoading: false,
                    getResourcesFromLabels: expect.any(Function),
                })
            )
        })
    })

    describe('when data is available', () => {
        beforeEach(() => {
            mockedUseGetHelpCenterArticleList.mockReturnValue({
                data: {
                    data: [
                        {id: 1, translation: {title: 'test1'}},
                        {id: 2, translation: {title: 'test2'}},
                    ],
                },
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>)

            mockedUseGetAICompatibleMacros.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [
                                    {id: 3, name: 'test1'},
                                    {id: 4, name: 'test2'},
                                ],
                            },
                        },
                    ],
                },
            } as unknown as ReturnType<typeof useGetAICompatibleMacros>)

            mockedUsePublicResources.mockReturnValue({
                sourceItems: [
                    {id: 5, url: 'test1'},
                    {id: 6, url: 'test2'},
                ],
                isSourceItemsListLoading: false,
            } as unknown as ReturnType<typeof usePublicResources>)

            mockedUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [
                    {id: 7, title: 'test1'},
                    {id: 8, title: 'test2'},
                ],
                isGuidanceArticleListLoading: false,
            } as unknown as ReturnType<typeof useGuidanceArticles>)

            mockedUseGetStoreWorkflowsConfigurations.mockReturnValue({
                data: [
                    {id: 9, name: 'test1'},
                    {id: 10, name: 'test2'},
                ],
                isLoading: false,
            } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        })

        it('should return data when available', () => {
            // Arrange

            const spyUseAIAgentGetOtherResources = jest.spyOn(
                useAIAgentGetOtherResources,
                'useAIAgentGetOtherResources'
            )

            // Act

            render(<TestComponent />)

            // Assert

            expect(spyUseAIAgentGetOtherResources).toHaveBeenLastCalledWith({
                articleHelpCenterId: 1,
                guidanceHelpCenterId: 2,
                snippetHelpCenterId: 3,
                shopName: 'test',
                shopType: 'test',
            })

            expect(spyUseAIAgentGetOtherResources).toHaveLastReturnedWith(
                expect.objectContaining({
                    articlesOptions: [
                        {value: 1, label: 'test1'},
                        {value: 2, label: 'test2'},
                    ],
                    guidanceOptions: [
                        {value: 7, label: 'test1'},
                        {value: 8, label: 'test2'},
                    ],
                    snippetsOptions: [
                        {value: 5, label: 'test1'},
                        {value: 6, label: 'test2'},
                    ],
                    macrosOptions: [
                        {value: 3, label: 'test1'},
                        {value: 4, label: 'test2'},
                    ],
                    actionsOptions: [
                        {value: 9, label: 'test1'},
                        {value: 10, label: 'test2'},
                    ],
                    isOtherResourceListLoading: false,
                    getResourcesFromLabels: expect.any(Function),
                })
            )
        })

        it('should provide getResourcesFromLabels function', () => {
            // Arrange

            const spyUseAIAgentGetOtherResources = jest.spyOn(
                useAIAgentGetOtherResources,
                'useAIAgentGetOtherResources'
            )

            // Act

            render(<TestComponent />)

            // Assert

            expect(spyUseAIAgentGetOtherResources).toHaveBeenLastCalledWith({
                articleHelpCenterId: 1,
                guidanceHelpCenterId: 2,
                snippetHelpCenterId: 3,
                shopName: 'test',
                shopType: 'test',
            })

            expect(spyUseAIAgentGetOtherResources).toHaveLastReturnedWith(
                expect.objectContaining({
                    getResourcesFromLabels: expect.any(Function),
                })
            )

            const {getResourcesFromLabels} = spyUseAIAgentGetOtherResources.mock
                .results[spyUseAIAgentGetOtherResources.mock.results.length - 1]
                .value as ReturnType<
                typeof useAIAgentGetOtherResources.useAIAgentGetOtherResources
            >

            expect(getResourcesFromLabels).toBeInstanceOf(Function)
            expect(getResourcesFromLabels(['Guidance::test1'])).toEqual([
                {type: 'resource', resourceType: 'guidance', resourceId: '7'},
            ])
            expect(
                getResourcesFromLabels(['Help Center articles::test1'])
            ).toEqual([
                {type: 'resource', resourceType: 'article', resourceId: '1'},
            ])
            expect(getResourcesFromLabels(['Macros::test1'])).toEqual([
                {type: 'resource', resourceType: 'macro', resourceId: '3'},
            ])
            expect(
                getResourcesFromLabels(['Actions::Soft action::test1'])
            ).toEqual([
                {type: 'resource', resourceType: 'soft_action', resourceId: 9},
            ])
            expect(
                getResourcesFromLabels(['Actions::Hard action::test2'])
            ).toEqual([
                {type: 'resource', resourceType: 'hard_action', resourceId: 10},
            ])
            expect(
                getResourcesFromLabels(['External websites::test2'])
            ).toEqual([
                {
                    type: 'resource',
                    resourceType: 'external_snippet',
                    resourceId: '6',
                },
            ])
        })
    })
})
