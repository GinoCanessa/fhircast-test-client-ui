import React, { useEffect, useRef, useState } from 'react';

import { 
  Box, 
  Button,
  Collapse,
  Divider,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Paper, 
  Select, 
  SelectChangeEvent, 
  Switch, 
  Tab, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Toolbar,
  Typography 
} from '@mui/material';

import { fhir, valueSetEnums as fhirEnums } from 'fhir-typescript-sdk-dev';

import { InternalMessage } from '../models/InternalMessage';
import HubConfigPane from '../components/HubConfigPane';

export interface MainPageProps {
  useDarkMode: boolean;
  toggleVisualMode: (() => void);
}

export default function MainPage(props: MainPageProps) {

  const _clientHostWebSocketRef = useRef<WebSocket | null>(null);
  const _internalMessageMap = useRef<Map<BigInt, InternalMessage>>(new Map());

  
  const [selectedMainTab, setSelectedMainTab] = useState<number>(0);

  function addMessage(message:string, data?:object|undefined) {
  }

  function connectWebsocket(wsUrl:string) {
    _clientHostWebSocketRef.current = new WebSocket(wsUrl);
    _clientHostWebSocketRef.current.onmessage = clientHostMessageHandler;
    _clientHostWebSocketRef.current.onerror = handleClientHostWebSocketError;
    _clientHostWebSocketRef.current.onclose = handleClientHostWebSocketClose;
  }
  
  function clientHostMessageHandler(event: MessageEvent) {
    console.log('Received websocket message event', event);
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
          </Tabs>
        </Box>

        { (selectedMainTab === 0) &&
        <HubConfigPane
          useDarkMode={props.useDarkMode}
          addMessage={addMessage}
          connectWebsocket={connectWebsocket}
          />
        }
      </Box>
    </Box>
  );
}