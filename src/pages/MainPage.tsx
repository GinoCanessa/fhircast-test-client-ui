import React, { useEffect, useRef, useState } from 'react';

import { 
  Box, 
  Tab, 
  Tabs,
  Toolbar,
  Typography 
} from '@mui/material';

import { InternalMessage } from '../models/InternalMessage';
import HubConfigPane from '../components/HubConfigPane';
import { FHIRcastEventTemplate } from '../models/FHIRcastEventTemplate';
import { FHIRcastWsConnectMessage } from '../models/FHIRcastWsConnectMessage';
import EventPane from '../components/EventPane';
import { StorageHelper } from '../util/StorageHelper';

export interface MainPageProps {
  useDarkMode: boolean;
  toggleVisualMode: (() => void);
}

export default function MainPage(props: MainPageProps) {

  const _clientHostWebSocketRef = useRef<WebSocket | null>(null);
  const _internalMessageMap = useRef<Map<BigInt, InternalMessage>>(new Map());

  const [websocketUrl, setWebsocketUrl] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  
  const [supportedEvents, setSupportedEvents] = useState<object>({});
  const [hubUrl, setHubUrl] = useState<string>('');
  const [hubTopic, setHubTopic] = useState<string>('');
  const [leaseSeconds, setLeaseSeconds] = useState<number>(5 * 60);
  const [subscriberName, setSubscriberName] = useState<string>('');
  const [bearerToken, setBearerToken] = useState<string>('');

  const [receivedEvents, setReceivedEvents] = useState<FHIRcastEventTemplate[]>([]);
  const [receivedConnects, setReceivedConnects] = useState<FHIRcastWsConnectMessage[]>([]);
  
  const [selectedMainTab, setSelectedMainTab] = useState<number>(0);

  useEffect(() => {
    if (StorageHelper.isLocalStorageAvailable) {
      if ((localStorage.getItem('useDarkMode') === 'true') && (!props.useDarkMode)) {
        props.toggleVisualMode();
      }

      setHubUrl(localStorage.getItem('hubUrl') ?? '');
      setHubTopic(localStorage.getItem('hubTopic') ?? '');
      setLeaseSeconds(Number.parseInt(localStorage.getItem('leaseSeconds') ?? '300'));
      setSubscriberName(localStorage.getItem('subscriberName') ?? 'FHIRcast Test Client');
      setBearerToken(localStorage.getItem('bearerToken') ?? '');
      setSupportedEvents(JSON.parse(localStorage.getItem('supportedEvents') ?? '{}'));
    }
  }, []);

  function addMessage(message:string, data?:object|undefined) {
  }

  function connectWebsocket(wsUrl:string) {
    if (StorageHelper.isLocalStorageAvailable) {
      localStorage.setItem('hubUrl', hubUrl);
      localStorage.setItem('hubTopic', hubTopic);
      localStorage.setItem('leaseSeconds', leaseSeconds.toString());
      localStorage.setItem('subscriberName', subscriberName);
      localStorage.setItem('bearerToken', bearerToken);
      localStorage.setItem('supportedEvents', JSON.stringify(supportedEvents));
    }


    _clientHostWebSocketRef.current = new WebSocket(wsUrl);
    _clientHostWebSocketRef.current.onmessage = clientHostMessageHandler;
    _clientHostWebSocketRef.current.onerror = handleClientHostWebSocketError;
    _clientHostWebSocketRef.current.onclose = handleClientHostWebSocketClose;
    setWebsocketUrl(wsUrl);
    setReceivedConnects([]);
    setReceivedEvents([]);
    setConnected(true);
  }
  
  function clientHostMessageHandler(event: MessageEvent) {
    // console.log('Received websocket message event', event);

    const obj:any = JSON.parse(event.data);
    if (obj['hub.mode']) {
      console.log('Received connection message', obj);
      setReceivedConnects([obj as FHIRcastWsConnectMessage]);
    }
    
    if (obj['id']) {
      console.log('Received event message', obj);
      let updated:FHIRcastEventTemplate[] = [obj, ...receivedEvents];
      console.log('Events...', updated);
      setReceivedEvents(updated);
    }
  }
  
  function handleClientHostWebSocketError(event: Event) {
    console.log('Websocket error', event);
    disconnectWebsocket();
  }

  function handleClientHostWebSocketClose(event: Event) {
    console.log('Received websocket close', event);
    disconnectWebsocket();
  }

  function disconnectWebsocket() {
    if (_clientHostWebSocketRef.current) {
      _clientHostWebSocketRef.current.onmessage = null;
      _clientHostWebSocketRef.current.close();
      _clientHostWebSocketRef.current = null;
    }
    setConnected(false);
    setWebsocketUrl('');
  }

  const handleMainTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedMainTab(newValue);
  };

  return(
    <Box sx={{ display: 'flex' }}>
      <Box component='main' sx={{ flexGrow: 1, px: 2 }}>
        <Toolbar/>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mb={1}>
          <Tabs value={selectedMainTab} onChange={handleMainTabChange} aria-label="FHIRcast usage tabs">
            <Tab label="Hub Config" id="hub-config-tab" aria-controls='hub-config-pane' />
            <Tab label="Events" id="events-tab" aria-controls='events-pane' />
          </Tabs>
        </Box>

        { (selectedMainTab === 0) &&
        <HubConfigPane
          useDarkMode={props.useDarkMode}
          addMessage={addMessage}
          connectWebsocket={connectWebsocket}

          supportedEvents={supportedEvents}
          setSupportedEvents={setSupportedEvents}
          hubUrl={hubUrl}
          setHubUrl={setHubUrl}
          hubTopic={hubTopic}
          setHubTopic={setHubTopic}
          leaseSeconds={leaseSeconds}
          setLeaseSeconds={setLeaseSeconds}
          subscriberName={subscriberName}
          setSubscriberName={setSubscriberName}
          bearerToken={bearerToken}
          setBearerToken={setBearerToken}
          connected={connected}
          websocketUrl={websocketUrl}
          />
        }

        { (selectedMainTab === 1) &&
        <EventPane
          useDarkMode={props.useDarkMode}
          addMessage={addMessage}

          receivedConnects={receivedConnects}
          receivedEvents={receivedEvents}
          />
        }
      </Box>
    </Box>
  );
}