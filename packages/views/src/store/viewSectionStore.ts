import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AllViewSectionsQueryData } from '../hooks/allViewSectionsQuery'
import type { ViewSection } from '../types'

const viewSectionsQueryKey = queryKeys.views.listAllViewSections()

export function syncViewSectionCreated(section: ViewSection) {
    updateAllViewSectionsQueries((data) => upsertViewSection(data, section))
}

export function syncViewSectionUpdated(section: ViewSection) {
    updateAllViewSectionsQueries((data) => upsertViewSection(data, section))
}

export function syncViewSectionDeleted(sectionId: number) {
    updateAllViewSectionsQueries((data) => deleteViewSection(data, sectionId))
}

function updateAllViewSectionsQueries(
    updateQueryData: (
        data: AllViewSectionsQueryData | undefined,
    ) => AllViewSectionsQueryData | undefined,
) {
    appQueryClient.setQueriesData<AllViewSectionsQueryData>(
        { queryKey: viewSectionsQueryKey },
        updateQueryData,
    )
    void appQueryClient.invalidateQueries({ queryKey: viewSectionsQueryKey })
}

function upsertViewSection(
    data: AllViewSectionsQueryData | undefined,
    section: ViewSection,
): AllViewSectionsQueryData | undefined {
    if (!data?.pages.length) {
        return data
    }

    const sectionExists = data.pages.some((page) =>
        page.data.data.some((cachedSection) => cachedSection.id === section.id),
    )

    if (sectionExists) {
        return {
            ...data,
            pages: data.pages.map((page) => ({
                ...page,
                data: {
                    ...page.data,
                    data: page.data.data.map((cachedSection) =>
                        cachedSection.id === section.id
                            ? section
                            : cachedSection,
                    ),
                },
            })),
        }
    }

    return {
        ...data,
        pages: data.pages.map((page, pageIndex) =>
            pageIndex === 0
                ? {
                      ...page,
                      data: {
                          ...page.data,
                          data: [...page.data.data, section],
                      },
                  }
                : page,
        ),
    }
}

function deleteViewSection(
    data: AllViewSectionsQueryData | undefined,
    sectionId: number,
): AllViewSectionsQueryData | undefined {
    if (!data?.pages.length) {
        return data
    }

    return {
        ...data,
        pages: data.pages.map((page) => ({
            ...page,
            data: {
                ...page.data,
                data: page.data.data.filter(
                    (section) => section.id !== sectionId,
                ),
            },
        })),
    }
}
