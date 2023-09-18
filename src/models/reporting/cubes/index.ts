import {AutomationBillingEventCubeWithJoins} from 'models/reporting/cubes/AutomationBillingEventCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'

export type Cubes =
    | HelpdeskMessageCubeWithJoins
    | AutomationBillingEventCubeWithJoins
