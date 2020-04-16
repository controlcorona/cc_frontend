import React, { useState } from 'react';
import './App.css';
import BotUi from './components/botUI/botUi';
import Map from './components/map/map';
import { interpolateCubehelixDefault } from 'd3';

function App() {
  const currentMap = {
    key : 'boundary',
    geoFilePath : 'boundary.json'
  };
  return (
    <div className="App">
        <BotUi />
        <Map mapMeta={currentMap}/>
    </div>
  );
}

export default App;
