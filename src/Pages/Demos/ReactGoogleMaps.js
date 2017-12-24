import React from 'react';
import './Card.css';
import _ from "lodash";
import { compose, withProps, withState, withHandlers} from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import Header from "../../Header";
import axios from 'axios';

var initData = [18.04873506884769, 18.03156893115238, 59.34684406531631, 59.34246779369348];
var data = GetMapData(initData[0], initData[1], initData[2], initData[3]);
var markerData = ['Please, make your choice ...', '', ''];
var pointId = '';
var removedPointId = '';

(() => data = GetMapData(initData))();

const MarkersList = () => {
  if (typeof data !== 'undefined') {
    return (
      data.map(function (ob) {
          return [ob.id, ob.vicinity, ob.name];
        }
      ));
  } else {
    return ['Please, make your choice ...', '', ''];
  }}

const MarkerView = ({closed, props}) => {
  if (typeof data !== 'undefined') {
    return (
      <div>
        {data.map(function (ob) {
          function setMarkerData() {
          return () => (pointId = ob.id,
          markerData[0] = ob.name,
          markerData[1] = ob.vicinity,
          props.setClosed(true),
          props.onZoomChange(MarkersList));
        }
          return ( removedPointId !== ob.id &&
          <Marker
          position={{lat: Number(ob.geometry.location.lat), lng: Number(ob.geometry.location.lng)}}
          key={ob.id}
          onClick={setMarkerData()}>
          </Marker>
          )

        })}
      </div>
    );
  } else
    {return
      (
        <div></div>
      );
    }}

const Card = ({closed, removeOnClick, props}) => {
  return (
    <div>
      <div className="card">
        <div>
          <div className="left1">
            <h5>{markerData[0]}</h5>
          </div>
          <div className={closed ? "open" : "closed" }>
            <img  src={require('./img/closingElement.png')} onClick={removeOnClick} alt="closingElement"/>
          </div>
          <div className="clear"></div>
          <div className="left2">{markerData[1]}</div>
        </div>
      </div>
    </div>
  );
}

const MyMapComponent = compose(
  withProps({
    googleMapURL:
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyCbkfpJp43QCTESypxG1Ch4lv3LYQfo-ro&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `1200px`, width: '700px' }} />,
    containerElement: <div style={{ height: `600px`, width: '650px', marginTop: '100px' }} />,
    mapElement: <div style={{ height: `300px`, width: '610px' }} />
  }),
  withState('zoom1', 'onZoomChange', []),
  withHandlers(() => {
    const refs = {
      map: undefined,
      pro: undefined,
      markerInfo: undefined
    }
    return {
      onMapMounted: () => (ref) => {
        refs.map = ref;
      },
      onMarkerMounted: () => (ref) => {
        refs.markerInfo = ref;
      },
      onAffectingMap: props => event => {
        var minLng = refs.map.getBounds().b.f;
        var maxLng = refs.map.getBounds().b.b;
        var minLat = refs.map.getBounds().f.f;
        var maxLat = refs.map.getBounds().f.b;
        GetMapData(minLng, maxLng, minLat, maxLat);
        var items = MarkersList;
        props.onZoomChange(items);
      },
    }}),
  withState('closed', 'setClosed', false),
  withHandlers({
    removeOnClick: props => event => {
      RemovePoint();
      console.log('removeOnClick');
      pointId = '';
      markerData[0] = 'Please, make your choice ...';
      markerData[1] = '';
      props.setClosed(!props.closed);
    },
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <div>
    <div>
      <div>
        <Card
          closed = {props.closed}
          removeOnClick ={props.removeOnClick}
          props={props} style={{ marginTop: '-100px', position: 'relative' }}/>
        <GoogleMap
          defaultZoom={16}
          defaultCenter={{ lat: 59.344656, lng: 18.040152 }}
          zoom1={props.zoom}
          ref={props.onMapMounted}
          onZoomChanged={props.onAffectingMap}
          onTilesLoaded={props.onAffectingMap}
          onDrag={props.onAffectingMap} >
          <MarkerView closed = {props.closed} props = {props} />
        </GoogleMap>
      </div>
    </div>
  </div>
));

function GetMapData(minLng, maxLng, minLat, maxLat) {
  var url = `https://endpoints.azurewebsites.net/api/points?minLng=` + minLng + `&maxLng=` + maxLng + `&minLat=`
    + minLat + `&maxLat=` + maxLat + ``;
  if (typeof minLat !== 'undefined') {
    console.log(url);
    axios.get(url)
      .then(res => {
        data = res.data;
        res.data.map(function (ob) {
          return data
        });
      });
    return data;
  } else {
    url = `https://endpoints.azurewebsites.net/api/points?minLng=18.04873506884769&maxLng=18.03156893115238&minLat=59.34684406531631&maxLat=59.34246779369348`;
    console.log(url);
    axios.get(url)
      .then(res => {
        data = res.data;
        res.data.map(function (ob) {
          return data
        });
      });
    return data;
  }

}

function RemovePoint() {
  if (pointId !== '') {
    removedPointId = pointId;
    var url = `https://endpoints.azurewebsites.net/api/points/` + pointId + ``;
    console.log(url);
    axios.delete(url)
      .then(markerData = ['Please, make your choice ...', '', '']);
  }
}

const enhance = _.identity;

const ReactGoogleMaps = () => [
  <Header key="header" />,
  <MyMapComponent key="map" />
];

export default enhance(ReactGoogleMaps);
