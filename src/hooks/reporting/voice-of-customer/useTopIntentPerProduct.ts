import { RequestedData } from 'hooks/reporting/types'
import { QueryReturnType } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { TicketCubeWithJoins } from 'models/reporting/cubes/TicketCube'
import { TicketCustomFieldsDimension } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { usePostReporting } from 'models/reporting/queries'
import { ticketCountPerProductAndIntentQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/intentPerProductQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { notUndefined } from 'utils/types'

type TopIntentPerProduct = {
    productId: string
    topIntent: string
    value: number
}

type TopIntentPerProductMap = Record<string, TopIntentPerProduct | undefined>

export const PRODUCT_ID_DIMENSION = TicketProductsEnrichedDimension.ProductId
export const INTENT_DIMENSION =
    TicketCustomFieldsDimension.TicketCustomFieldsValueString
export const TICKET_COUNT_MEASURE = TicketProductsEnrichedMeasure.TicketCount

const getTopIntentPerProduct = (
    data: QueryReturnType<TicketCubeWithJoins> | undefined,
    productId?: string,
): { value: string | null; allData: TopIntentPerProduct[] } => {
    const topIntentPerProductMap: TopIntentPerProductMap =
        data === undefined
            ? {}
            : data.reduce<TopIntentPerProductMap>((acc, item) => {
                  const productId = item[PRODUCT_ID_DIMENSION]
                  const intent = item[INTENT_DIMENSION]
                  const ticketCount = Number(item[TICKET_COUNT_MEASURE])
                  if (!productId || !intent) return acc

                  const currentTopIntent = acc[productId]

                  if (currentTopIntent) {
                      if (currentTopIntent.value < Number(ticketCount)) {
                          acc[productId] = {
                              productId,
                              topIntent: intent,
                              value: Number(ticketCount),
                          }
                      }
                  } else {
                      acc[productId] = {
                          productId,
                          topIntent: intent,
                          value: Number(ticketCount),
                      }
                  }

                  return acc
              }, {})

    const allData = Object.values(topIntentPerProductMap).filter(notUndefined)

    if (!productId) {
        return {
            value: null,
            allData,
        }
    }

    const topIntent: string | null =
        topIntentPerProductMap[productId]?.topIntent ?? null

    return {
        value: topIntent,
        allData,
    }
}

export const useTopIntentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: string,
    productId?: string,
): {
    data: {
        value: string | null
        allData: { productId: string; topIntent: string; value: number }[]
    }
} & RequestedData => {
    const { data, isFetching, isError } = usePostReporting<
        QueryReturnType<TicketCubeWithJoins>,
        QueryReturnType<TicketCubeWithJoins>
    >(
        [
            ticketCountPerProductAndIntentQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                OrderDirection.Desc,
            ),
        ],
        {
            select: (data) => data.data.data,
        },
    )

    return {
        data: getTopIntentPerProduct(data, productId),
        isFetching,
        isError,
    }
}
