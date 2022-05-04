import { FHIRcastEvent } from './FHIRcastEvent';

export interface FHIRcastEventTemplate {
  timestamp:Date;
  id:string;
  event:FHIRcastEvent;
}