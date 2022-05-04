import { FHIRcastContext } from './FHIRcastContext';

export interface FHIRcastEvent {
  'hub.topic':string;
  'hub.event':string,
  context: FHIRcastContext[];
}