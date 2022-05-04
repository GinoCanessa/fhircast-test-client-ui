
export interface FHIRcastWsConnectMessage {
  'hub.mode':string;
  'hub.topic':string;
  'hub.events':string;
  'hub.lease_seconds':string;
}