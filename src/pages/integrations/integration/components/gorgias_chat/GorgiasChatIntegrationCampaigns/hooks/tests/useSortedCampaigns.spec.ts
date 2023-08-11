import {act, renderHook} from '@testing-library/react-hooks'

import useSearch from 'hooks/useSearch'

import {useSortedCampaigns} from '../useSortedCampaigns'

import {ChatCampaign} from '../../types/Campaign'

jest.mock('hooks/useSearch')

const campaigns: ChatCampaign[] = [
    {
        name: 'EcoWaves: Ride the Green Tide',
        id: 'bff7506e-2694-49d9-98d0-d313145b9eb0',
        triggers: [],
        message: {
            text: 'Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide',
            html: '<div>Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide</div>',
        },
        meta: {
            delay: 0,
            noReply: false,
        },
    },
    {
        name: 'TechConnect: Bridging Tomorrow',
        id: 'feb4fcfd-76a0-4b4a-82e6-f38d2cc2455e',
        triggers: [],
        message: {
            text: 'Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture',
            html: '<div>Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture</div>',
        },
        meta: {
            delay: 0,
            noReply: false,
        },
        created_datetime: '2023-08-01T07:25:02.983Z',
    },
    {
        name: 'Mindful Moments: Embrace Tranquility',
        id: '21d40a12-76b6-48da-9b1d-d388857cf8ab',
        triggers: [],
        message: {
            text: 'Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility',
            html: '<div>Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility</div>',
        },
        meta: {
            delay: 0,
            noReply: false,
        },
        deactivated_datetime: '2023-08-11T07:45:51.318Z',
        created_datetime: '2023-08-02T07:25:02.983Z',
    },
    {
        name: 'FitLife Revolution: Power Your Potential',
        id: 'acb5ee07-bcf0-410d-aa63-f23baf745a9e',
        triggers: [],
        message: {
            text: "Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we'll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals",
            html: '<div>Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we&#x27;ll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals</div>',
        },
        meta: {
            delay: 0,
            noReply: false,
        },
        created_datetime: '2023-08-03T07:25:02.983Z',
    },
    {
        name: 'Artistic Fusion: Colors Unite',
        id: 'e8e5e53d-52b4-4373-9f9a-3e83040d9bbb',
        triggers: [],
        message: {
            text: "Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we'll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity",
            html: '<div>Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we&#x27;ll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity</div>',
        },
        meta: {
            delay: 0,
            noReply: false,
        },
        deactivated_datetime: '2023-08-11T07:45:51.318Z',
        created_datetime: '2023-08-04T07:25:02.983Z',
    },
]

describe('useSortedCampaigns()', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
            },
        })
        ;(useSearch as jest.Mock).mockImplementation(() => ({}))
    })

    it('should sort campaigns by status and creation date by default', () => {
        const {result} = renderHook(() => useSortedCampaigns(campaigns))

        expect(result.current.sortBy).toBeUndefined()
        expect(result.current.sortedCampaigns).toStrictEqual([
            {
                name: 'EcoWaves: Ride the Green Tide',
                id: 'bff7506e-2694-49d9-98d0-d313145b9eb0',
                triggers: [],
                message: {
                    text: 'Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide',
                    html: '<div>Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
            },
            {
                name: 'FitLife Revolution: Power Your Potential',
                id: 'acb5ee07-bcf0-410d-aa63-f23baf745a9e',
                triggers: [],
                message: {
                    text: "Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we'll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals",
                    html: '<div>Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we&#x27;ll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                created_datetime: '2023-08-03T07:25:02.983Z',
            },
            {
                name: 'TechConnect: Bridging Tomorrow',
                id: 'feb4fcfd-76a0-4b4a-82e6-f38d2cc2455e',
                triggers: [],
                message: {
                    text: 'Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture',
                    html: '<div>Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                created_datetime: '2023-08-01T07:25:02.983Z',
            },
            {
                name: 'Artistic Fusion: Colors Unite',
                id: 'e8e5e53d-52b4-4373-9f9a-3e83040d9bbb',
                triggers: [],
                message: {
                    text: "Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we'll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity",
                    html: '<div>Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we&#x27;ll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                deactivated_datetime: '2023-08-11T07:45:51.318Z',
                created_datetime: '2023-08-04T07:25:02.983Z',
            },
            {
                name: 'Mindful Moments: Embrace Tranquility',
                id: '21d40a12-76b6-48da-9b1d-d388857cf8ab',
                triggers: [],
                message: {
                    text: 'Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility',
                    html: '<div>Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                deactivated_datetime: '2023-08-11T07:45:51.318Z',
                created_datetime: '2023-08-02T07:25:02.983Z',
            },
        ])
    })

    it('should toggle the order if the sorting key is unchanged', () => {
        const {result} = renderHook(() => useSortedCampaigns(campaigns))

        act(() => {
            result.current.changeSorting('name')
        })
        expect(result.current.sortBy).toBe('name')
        expect(result.current.sortDirection).toEqual('asc')

        act(() => {
            result.current.changeSorting('name')
        })
        expect(result.current.sortBy).toBe('name')
        expect(result.current.sortDirection).toEqual('desc')
    })

    it('should update the sorting key and direction', () => {
        ;(useSearch as jest.Mock).mockImplementation(() => ({
            sortBy: 'name',
            sortDirection: 'desc',
        }))
        const {result} = renderHook(() => useSortedCampaigns(campaigns))

        expect(result.current.sortBy).toBe('name')
        expect(result.current.sortDirection).toEqual('desc')

        act(() => {
            result.current.changeSorting('created_datetime')
        })

        expect(result.current.sortBy).toBe('created_datetime')
        expect(result.current.sortDirection).toEqual('asc')
    })

    describe('sorting by name', () => {
        const descOrder = [
            {
                name: 'Artistic Fusion: Colors Unite',
                id: 'e8e5e53d-52b4-4373-9f9a-3e83040d9bbb',
                triggers: [],
                message: {
                    text: "Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we'll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity",
                    html: '<div>Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we&#x27;ll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                deactivated_datetime: '2023-08-11T07:45:51.318Z',
                created_datetime: '2023-08-04T07:25:02.983Z',
            },
            {
                name: 'EcoWaves: Ride the Green Tide',
                id: 'bff7506e-2694-49d9-98d0-d313145b9eb0',
                triggers: [],
                message: {
                    text: 'Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide',
                    html: '<div>Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
            },
            {
                name: 'FitLife Revolution: Power Your Potential',
                id: 'acb5ee07-bcf0-410d-aa63-f23baf745a9e',
                triggers: [],
                message: {
                    text: "Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we'll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals",
                    html: '<div>Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we&#x27;ll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                created_datetime: '2023-08-03T07:25:02.983Z',
            },
            {
                name: 'Mindful Moments: Embrace Tranquility',
                id: '21d40a12-76b6-48da-9b1d-d388857cf8ab',
                triggers: [],
                message: {
                    text: 'Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility',
                    html: '<div>Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                deactivated_datetime: '2023-08-11T07:45:51.318Z',
                created_datetime: '2023-08-02T07:25:02.983Z',
            },
            {
                name: 'TechConnect: Bridging Tomorrow',
                id: 'feb4fcfd-76a0-4b4a-82e6-f38d2cc2455e',
                triggers: [],
                message: {
                    text: 'Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture',
                    html: '<div>Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                created_datetime: '2023-08-01T07:25:02.983Z',
            },
        ]

        const ascOrder = [...descOrder].reverse()

        it('should sort campaigns by name in descending order', () => {
            ;(useSearch as jest.Mock).mockImplementation(() => ({
                sortBy: 'name',
                sortDirection: 'desc',
            }))
            const {result} = renderHook(() => useSortedCampaigns(campaigns))

            expect(result.current.sortBy).toEqual('name')
            expect(result.current.sortDirection).toEqual('desc')

            expect(result.current.sortedCampaigns).toStrictEqual(descOrder)
        })

        it('should sort campaigns by name in ascending order', () => {
            ;(useSearch as jest.Mock).mockImplementation(() => ({
                sortBy: 'name',
                sortDirection: 'asc',
            }))
            const {result} = renderHook(() => useSortedCampaigns(campaigns))

            expect(result.current.sortBy).toEqual('name')
            expect(result.current.sortDirection).toEqual('asc')

            expect(result.current.sortedCampaigns).toStrictEqual(ascOrder)
        })
    })

    describe('sorting by created_datetime', () => {
        const descOrder = [
            {
                name: 'TechConnect: Bridging Tomorrow',
                id: 'feb4fcfd-76a0-4b4a-82e6-f38d2cc2455e',
                triggers: [],
                message: {
                    text: 'Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture',
                    html: '<div>Bridging tomorrow starts today! Embrace the power of technology to shape a brighter future. Join our community of tech enthusiasts, visionaries, and changemakers as we connect minds and explore limitless possibilities. #TechConnect #Innovation #BrighterFuture</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                created_datetime: '2023-08-01T07:25:02.983Z',
            },
            {
                name: 'Mindful Moments: Embrace Tranquility',
                id: '21d40a12-76b6-48da-9b1d-d388857cf8ab',
                triggers: [],
                message: {
                    text: 'Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility',
                    html: '<div>Inhale tranquility, exhale stress. Unlock inner peace and mindfulness on this transformative journey. Take a moment to breathe, reflect, and embrace the beauty within and around you. #MindfulMoments #InnerPeace #Tranquility</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                deactivated_datetime: '2023-08-11T07:45:51.318Z',
                created_datetime: '2023-08-02T07:25:02.983Z',
            },
            {
                name: 'FitLife Revolution: Power Your Potential',
                id: 'acb5ee07-bcf0-410d-aa63-f23baf745a9e',
                triggers: [],
                message: {
                    text: "Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we'll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals",
                    html: '<div>Power your potential and ignite your fitness journey! Join our tribe of health enthusiasts as we revolutionize the way we approach fitness and well-being. Together, we&#x27;ll break barriers and achieve new heights of strength and vitality. #FitLifeRevolution #PowerYourPotential #FitnessGoals</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                created_datetime: '2023-08-03T07:25:02.983Z',
            },
            {
                name: 'Artistic Fusion: Colors Unite',
                id: 'e8e5e53d-52b4-4373-9f9a-3e83040d9bbb',
                triggers: [],
                message: {
                    text: "Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we'll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity",
                    html: '<div>Colors unite us all! Celebrate diversity and creativity as we fuse artistic expressions from around the world. Join our vibrant community and let your imagination run free. Together, we&#x27;ll paint a canvas of unity and inspiration. #ArtisticFusion #CreativityUnleashed #UnityInDiversity</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
                deactivated_datetime: '2023-08-11T07:45:51.318Z',
                created_datetime: '2023-08-04T07:25:02.983Z',
            },
            {
                name: 'EcoWaves: Ride the Green Tide',
                id: 'bff7506e-2694-49d9-98d0-d313145b9eb0',
                triggers: [],
                message: {
                    text: 'Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide',
                    html: '<div>Join us on a journey to sustainability and ride the green tide! Discover innovative ways to protect our planet and make a positive impact. Together, we can create a cleaner and greener future for generations to come. #EcoWaves #Sustainability #GreenTide</div>',
                },
                meta: {
                    delay: 0,
                    noReply: false,
                },
            },
        ]

        const ascOrder = [...descOrder].reverse()

        it('should sort campaigns by created_datetime in descending order', () => {
            ;(useSearch as jest.Mock).mockImplementation(() => ({
                sortBy: 'created_datetime',
                sortDirection: 'desc',
            }))
            const {result} = renderHook(() => useSortedCampaigns(campaigns))

            expect(result.current.sortBy).toEqual('created_datetime')
            expect(result.current.sortDirection).toEqual('desc')

            expect(result.current.sortedCampaigns).toStrictEqual(descOrder)
        })

        it('should sort campaigns by created_datetime in ascending order', () => {
            ;(useSearch as jest.Mock).mockImplementation(() => ({
                sortBy: 'created_datetime',
                sortDirection: 'asc',
            }))
            const {result} = renderHook(() => useSortedCampaigns(campaigns))

            expect(result.current.sortBy).toEqual('created_datetime')
            expect(result.current.sortDirection).toEqual('asc')

            expect(result.current.sortedCampaigns).toStrictEqual(ascOrder)
        })
    })
})
