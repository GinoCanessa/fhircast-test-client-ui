import { fhir } from 'fhir-typescript-sdk-dev';

export interface AppComponentProps {
  useDarkMode: boolean,
  addMessage: (display:string, data?:object|undefined) => void,
}