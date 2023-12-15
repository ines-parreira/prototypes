import {AutomationBillingEventCubeWithJoins} from 'models/reporting/cubes/AutomationBillingEventCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {HelpCenterTrackingEventCube} from './HelpCenterTrackingEventCube'
import {VoiceCallCube} from './VoiceCallCube'

export type Cubes =
    | HelpdeskMessageCubeWithJoins
    | AutomationBillingEventCubeWithJoins
    | HelpCenterTrackingEventCube
    | VoiceCallCube
