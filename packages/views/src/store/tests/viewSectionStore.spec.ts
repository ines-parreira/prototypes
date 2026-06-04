import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AllViewSectionsQueryData } from '../../hooks/allViewSectionsQuery'
import type { ViewSection } from '../../types'
import {
    syncViewSectionCreated,
    syncViewSectionDeleted,
    syncViewSectionUpdated,
} from '../viewSectionStore'

const viewSectionsQueryKey = queryKeys.views.listAllViewSections({
    limit: 100,
})

const createSection = (
    overrides: Partial<ViewSection> & Pick<ViewSection, 'id'>,
): ViewSection => ({
    decoration: null,
    id: overrides.id,
    name: `Section ${overrides.id}`,
    private: false,
    ...overrides,
})

const createQueryData = (sections: ViewSection[]): AllViewSectionsQueryData =>
    ({
        pages: [
            {
                data: {
                    data: sections,
                },
            },
        ],
        pageParams: [undefined],
    }) as AllViewSectionsQueryData

beforeEach(() => {
    appQueryClient.clear()
})

describe('viewSectionStore', () => {
    it('adds created sections to cached list-all view sections data', () => {
        const existingSection = createSection({ id: 1 })
        const createdSection = createSection({ id: 2 })
        appQueryClient.setQueryData(
            viewSectionsQueryKey,
            createQueryData([existingSection]),
        )

        syncViewSectionCreated(createdSection)

        expect(
            appQueryClient.getQueryData<AllViewSectionsQueryData>(
                viewSectionsQueryKey,
            )?.pages[0].data.data,
        ).toEqual([existingSection, createdSection])
    })

    it('updates cached list-all view sections data', () => {
        const existingSection = createSection({ id: 1 })
        const updatedSection = createSection({
            id: 1,
            name: 'Updated section',
        })
        appQueryClient.setQueryData(
            viewSectionsQueryKey,
            createQueryData([existingSection]),
        )

        syncViewSectionUpdated(updatedSection)

        expect(
            appQueryClient.getQueryData<AllViewSectionsQueryData>(
                viewSectionsQueryKey,
            )?.pages[0].data.data,
        ).toEqual([updatedSection])
    })

    it('removes deleted sections from cached list-all view sections data', () => {
        const deletedSectionId = 1
        const deletedSection = createSection({ id: deletedSectionId })
        const remainingSection = createSection({ id: 2 })
        appQueryClient.setQueryData(
            viewSectionsQueryKey,
            createQueryData([deletedSection, remainingSection]),
        )

        syncViewSectionDeleted(deletedSectionId)

        expect(
            appQueryClient.getQueryData<AllViewSectionsQueryData>(
                viewSectionsQueryKey,
            )?.pages[0].data.data,
        ).toEqual([remainingSection])
    })
})
