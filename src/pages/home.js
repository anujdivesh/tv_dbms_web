import React, {useEffect, useRef, useState} from "react";
import './test.css';
import BootstrapTable from 'react-bootstrap-table-next';
import axios from "axios";
import * as ReactBootStrap from 'react-bootstrap';
import paginationFactory, { PaginationProvider, PaginationTotalStandalone, PaginationListStandalone } from 'react-bootstrap-table2-paginator';
import Multiselect from 'multiselect-react-dropdown';
import { MapContainer} from 'react-leaflet';
import {Button,Modal} from "react-bootstrap";
import JSONPretty from 'react-json-pretty';
import { MdOutlinePageview } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import 'leaflet-draw/dist/leaflet.draw.css'; // Import Leaflet Draw CSS
import AuthService from "../services/auth.service";
import {mayFlyer, addEEZ} from './helper';
import 'leaflet-providers';
import "leaflet-bing-layer";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { get_url } from "./urls";

toast.configure()

const Home = () => {

  //VARIABLES
  const markersLayer = useRef(null);
  const mapContainermain = useRef(null);
  const baseLayermain = useRef();
  var JSONPrettyMon = require('react-json-pretty/dist/monikai');
  const [unauthorized, setUnauthorized] = useState(false);
  const [infoshow, setinfoshow] = useState(false);
  const [infotext, setinfotext] = useState(false);
  const [table, setTable] = useState({tags:[], flags:[], topics:[], parameters:[]});
  const [metadata, setMetadata] = useState('');
  const [infoshow2, setinfoshow2] = useState(false);
  const [infoshow22, setinfoshow22] = useState(false);
  const [message, setMessage] = useState('');
  const [css, setCss] = useState('btn btn-warning');
  const [header, setHeader] = useState('Success');
  const [infotext2, setinfotext2] = useState(false);
  const infotext2Ref = useRef(false);
  const layer = useRef(null);
  const layer2 = useRef(null);
  const layer3 = useRef(null);
  const mapContainer = useRef(null);
  const baseLayer = useRef();
  const _isMounted = useRef(true);
  const [title, setTitle] = useState('');
  const [extent, setExtent] = useState('');
  const extentref = useRef('');
  const titleref = useRef('%');
  const countryref = useRef('%');
  const datatyperef = useRef('%');
  const projectref = useRef('%');
  const isMarkerRef = useRef();
  const positionRef = useRef([0.878032, 185.843298]);
  const zoomRef = useRef(3);
  const markerRef = useRef([51.505, -0.09])
  const bboxRef = useRef([[-20.3034175184893,181.97255105015114],[-15.241789855961722,175.9708637472084]]);
  const countryFlagRef = useRef(require('../flags/FJI.png'))
  const [loading, setLoading] =useState(true);
  const [obsSource, setobsSource] =useState([]);
  const [parameter, setParameter]  = useState([{key:'%',label:"%"}]);
  const [parameterlist,setParameterlist] = useState([]);
  const [country, setCountry]  = useState();
  const [countrylist,setCountrylist] = useState([]);
  const [datatype, setDatatype]  = useState();
  const [datatypelist,setDatatypelist] = useState([]);
  const [project, setProject]  = useState('');
  const [projectlist,setProjectlist] = useState([]);
  const [tag, setTag]  = useState([{key:'%',label:"%"}]);
  const [taglist,setTaglist] = useState([]);
  const [topic, setTopic]  = useState([{key:'%',label:"%"}]);
  const [topiclist,setTopiclist] = useState([]);
  const [checked, setChecked] = React.useState(false);
  const [token, setToken] = React.useState(null);

  const handleinfo = () => {
    setinfoshow(false)
  };
  const handleinfo2 = () => {
    setinfoshow2(false)
  };
  const handleinfo22 = () => {
    setinfoshow22(false)
  };

  const handleUpdate = () => {
    const obj = JSON.parse(metadata);
    
            const header = {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
            axios.put(get_url('root-path') + '/api/metadata/'+obj.id, obj, {headers:header})
              .then(response2 => {
                setinfoshow2(false)
                setCss('btn btn-success')
                setHeader('Success')
                setMessage(response2.data.message)
                setinfoshow22(true)
            //    window.location.reload();
            }).catch((error) => {
              setinfoshow2(false)
              setCss('btn btn-danger')
              setHeader('Error')
              setMessage('Opps! An Error Occurred. Please contact Administrator.')
              setinfoshow22(true)
          });
            
  
          
  };
  
  const handleClick = (e) => {
      setChecked(!checked)
      e.currentTarget.blur();
    }

    const getPlayerData = async (e) => {

      if (countryref.current === "%" || datatyperef.current === "%"){
        setCss('btn btn-warning')
        setHeader('Warning')
        setMessage("Country and Data Type are Required Fields.")
        setinfoshow22(true)
      }
      else{
      try {
        // Clear existing layers
        if (markersLayer.current != null) {
          markersLayer.current = L.featureGroup().addTo(mapContainermain.current).on("click", groupClick);
        }
        layer2.current = null;
        
        mapContainermain.current.eachLayer(function (layer) {
          const layername = layer.options.id;
          if (layername === 8) {
            mapContainermain.current.removeLayer(layer);
          }
        });
    
        setLoading(false);
        setobsSource([]);
    
        // Construct query parameters
        const params = new URLSearchParams();
        params.append('title', titleref.current || '%');
        params.append('country_id', countryref.current || 'TV');
        params.append('data_type_id', datatyperef.current || '%');
        params.append('project_id', projectref.current || '%');
        params.append('topic_id', topic[0]?.key || '%');
        params.append('keyword_id', tag[0]?.key || '%');
        params.append('is_restricted', '%');
    
        // Make GET request
        const url = get_url('root-path') + `/ocean_api/api/metadata/search?${params.toString()}`;
        console.log(url)
        const response = await axios.get(url);
        const data = response.data.data;
    
        // Process the response data
        let counter = 1;
        var polygon = [];
        for (const item of data) {
          let temp = [];
          const country = item.country?.long_name || 'Unknown';
          const desc2 = item.title;
          const title = item.abstract || '';
          const datatype = item.data_type?.datatype_code || 'Unknown';
          const project = item.project?.project_code || 'Unknown';
          const is_restricted = item.is_restricted;
          const email = item.contact?.email || '';
          const version = item.version;
          const dtatype = item.data_type?.id;
          
          const extents = {
            ymin: item.south_bounding_box,
            ymax: item.north_bounding_box,
            xmin: item.west_bounding_box,
            xmax: item.east_bounding_box
          };

    
            
          const coordbbox = [
            [extents.ymin, extents.xmin], // SW corner
            [extents.ymax, extents.xmax]  // NE corner
          ];
  
            
            const marker = L.rectangle(coordbbox, {id: 8, color: '#FF5733', weight: 3})
              .addTo(markersLayer.current)
              .bindPopup(`<div style='width: 150px; text-align: center;'>${desc2}</div>`, {
                maxWidth: "auto"
              });
            marker.test = item.id;
            marker.type = datatype;
            

          temp.push({
            "id": counter,
            "idx": item.id,
            "desc": desc2,
            "title": title,
            "datatype": datatype,
            "country": country,
            "project": project,
            "is_restricted": is_restricted,
            "version": version,
            "email": email,
            "has_fileupload": item.has_fileupload,
            "canonical_url": item.canonical_url
          });
          
          counter++;
          polygon.push(temp);
          setobsSource(prevData => [...prevData, ...temp]);
        }
    
        // Fit map to bounds
        fitbbox(mapContainermain.current, mayFlyer(countryref.current));
        setLoading(true);
    
      } catch (e) {
        console.error("Error fetching data:", e);
        setCss('btn btn-warning');
        setHeader('Error');
        setMessage("Failed to fetch data. Please try again.");
        setinfoshow22(true);
        setLoading(false);
      }
    }
    };
  const fetchparameters = () => {
    axios
      .get(get_url('root-path') + '/api/parameters')
      .then((response) => {
        const { data } = response;
        if(response.status === 200){
          var temp=[]
          for (var i =0; i <data.length; i++){
            temp.push({key:data[i].short_name, label:data[i].standard_name})
          }
            //check the api call is success by stats code 200,201 ...etc
            setParameterlist(temp)
        }else{
            //error handle section 
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchtags = () => {
    axios
      .get( get_url('root-path')+'/ocean_api/api/keywords')
      .then((response) => {
        const { data } = response;
        if(response.status === 200){
          var temp=[]
          for (var i =0; i <data.length; i++){
            temp.push({key:data[i].name, label:data[i].name})
          }
            //check the api call is success by stats code 200,201 ...etc
            setTaglist(temp)
        }else{
            //error handle section 
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchdatatype = () => {
    axios
      .get( get_url('root-path')+'/ocean_api/api/data_type')
      .then((response) => {
        const { data } = response;
        if(response.status === 200){
            //check the api call is success by stats code 200,201 ...etc
            setDatatypelist(data)
        }else{
            //error handle section 
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchcountry = () => {
    axios
      .get(get_url('root-path')+'/ocean_api/api/countries')
      .then((response) => {
        const { data } = response;
        if(response.status === 200){
            //check the api call is success by stats code 200,201 ...etc
            setCountrylist(data)
            
        }else{
            //error handle section 
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchproject = () => {
    axios
      .get(get_url('root-path')+'/ocean_api/api/projects')
      .then((response) => {
        const { data } = response;
        if(response.status === 200){
            //check the api call is success by stats code 200,201 ...etc
            setProjectlist(data)
        }else{
            //error handle section 
        }
      })
      .catch((error) => console.log(error));
  };
  const fetchtopic = () => {
    axios
      .get(get_url('root-path')+'/ocean_api/api/topics')
      .then((response) => {
        const { data } = response;
        if(response.status === 200){
          var temp=[]
          for (var i =0; i <data.length; i++){
            temp.push({key:data[i].name, label:data[i].name})
          }
            //check the api call is success by stats code 200,201 ...etc
            setTopiclist(temp)
        }else{
            //error handle section 
        }
      })
      .catch((error) => console.log(error));
  };
  const columns = [
      {dataField: "id", text:"ID",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "desc", text:"Title",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "title", text:"Description",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "datatype", text:"Data Type",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "country", text:"Country",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "project", text:"Project",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "is_restricted", text:"Restricted",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "email", text:"Contact",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "version", text:"Version",style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}},
      {dataField: "edit", text:"Action",formatter: rankFormatter,style:{fontSize:'13px', padding:'1px'},headerStyle: { backgroundColor: '#215E95', color: 'white'}}
  ]

  const loopToGetCoord = (extents,pos) =>{
    for (var i =0; i<extents.length; i++){
      if(extents[i].extent_name === pos){
        return extents[i].value;
      }
    }
  }

  function addMarker(map, markercoord, id) {
  
    const redIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    var layer = L.marker(markercoord,{icon:redIcon,id:id}).addTo(map);//.openPopup();
    map.flyTo(markercoord, 12);
    return layer;
  
  
  }

  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  function fitbbox(map, bbox){
    map.fitBounds(bbox);
    return map;
  }

  function addBBox(map, bbox) {
   
    var rect = L.rectangle(bbox, {color: '#FF5733', weight: 3}).addTo(map);
    map.fitBounds(bbox);
    return rect;
  
  
  }
  
  /*
  const getOneData = async (row) => {
  //  console.log('anuj',row)
    setLoading(false)
    
    const data2 = await axios.get("https://opmdata.gem.spc.int/api/metadata/id/"+row);
    
    countryFlagRef.current =  require('../flags/'+data2.data[0].countries[0].short_name+'.png')

    var extents = data2.data[0].spatial_extents;
    
    var dtatype = data2.data[0].data_type.id;
    if (dtatype === 6){
      isMarkerRef.current = true;
    }
    else{
      isMarkerRef.current = false
    }
    var coord_marker = [];
    var coordbbox = [];
    if (isMarkerRef.current){
      coord_marker.push(loopToGetCoord(extents,"ymin"))
      coord_marker.push(loopToGetCoord(extents,"xmin"))
      //console.log(coord_marker)
      markerRef.current = coord_marker;
      positionRef.current = coord_marker;
      zoomRef.current = 10;
    }
    else{
      var tmp = []
      tmp.push(loopToGetCoord(extents,"ymin"))
      tmp.push(loopToGetCoord(extents,"xmin"))
      coordbbox.push(tmp)
      tmp = [];
      tmp.push(loopToGetCoord(extents,"ymax"))
      tmp.push(loopToGetCoord(extents,"xmax"))
      coordbbox.push(tmp)
      //console.log(coordbbox)
      bboxRef.current = coordbbox;
      positionRef.current = tmp;
      zoomRef.current = 4;
      //const map = mapRef.current;
   // console.log('map state', map);
    //console.log("map ref", mapRef);
    
    
      //map.flyTo([-8.541147, 179.196198], 12);
    }
    const jsonData = JSON.stringify(data2.data[0], null, 2);
    var parameters = [];
    var extentsarr = [];
    var flags = [];
    var tags = [];
    var topics = [];
    var sourceurl = [];

    var metadata = {};
    metadata.title = data2.data[0].title;
    metadata.description = data2.data[0].description;
    metadata.temporal_coverage_from = data2.data[0].temporal_coverage_from;
    metadata.temporal_coverage_to = data2.data[0].temporal_coverage_to;
    metadata.language = data2.data[0].language;
    metadata.version = data2.data[0].version;
    metadata.is_restricted = String(data2.data[0].is_restricted);
    metadata.is_checked = String(data2.data[0].is_checked);
    metadata.createdAt = data2.data[0].createdAt;
    metadata.data_type = data2.data[0].data_type.datatype_code;
    metadata.country = data2.data[0].countries[0].country_name;
    metadata.spatial_projection = data2.data[0].spatial_projection.name;
    metadata.project = data2.data[0].project.project_name;
    metadata.organization = data2.data[0].organization.name;
    metadata.contact = data2.data[0].contact.email;
    metadata.license = data2.data[0].license.name;
    
    for (var h =0; h<data2.data[0].flags.length; h++){
      flags.push(data2.data[0].flags[h].name)
    }
    metadata.flags = flags;

    for (var i =0; i<data2.data[0].topics.length; i++){
      topics.push(data2.data[0].topics[i].name)
    }
    metadata.topics = topics;

    for (var j =0; j<data2.data[0].tags.length; j++){
      tags.push(data2.data[0].tags[j].name)
    }
    metadata.tags = tags;

    for (var k =0; k<data2.data[0].sourceurls.length; k++){
      sourceurl.push(data2.data[0].sourceurls[k].value)
    }
    metadata.sourceurl = sourceurl.join(', ') === "" ? "NAN" : sourceurl.join(', ');

    for (var l =0; l<data2.data[0].spatial_extents.length; l++){
      extentsarr.push(data2.data[0].spatial_extents[l].extent_name+"="+data2.data[0].spatial_extents[l].value)
    }
    metadata.extents = extents.join(', ') === "" ? "NAN" : extentsarr.join(', ');

    for (var m =0; m<data2.data[0].parameters.length; m++){
      parameters.push(data2.data[0].parameters[m].short_name)
    }
    
    if (parameters.length === 0) {parameters.push('NAN') }
    metadata.parameters = parameters;

    metadata.updatedAt = data2.data[0].updatedAt;
    metadata.created_by = data2.data[0].created_by.email;


    setTable(metadata)
    setinfotext(jsonData)
    setLoading(true)
    setinfoshow(true)
    setTimeout(function() {
      
    initMap(isMarkerRef.current, markerRef.current, bboxRef.current);
    }, 300);
    
  }*/

    const getOneData = async (id) => {
      try {
        setLoading(false);
        
        // Fetch single record
        const response = await axios.get(get_url('root-path') + `/ocean_api/api/metadata/${id}`);
        const data = response.data; // Assuming the response is the object directly
        
        // Set country flag
        countryFlagRef.current = require(`../flags/${data.country.short_name}.png`);
    
        // Determine if it's a marker or rectangle
        const isMarker = data.data_type.id === 6;
        isMarkerRef.current = isMarker;
    
        // Handle spatial extents
        const extents = {
          ymin: data.south_bounding_box,
          ymax: data.north_bounding_box,
          xmin: data.west_bounding_box,
          xmax: data.east_bounding_box
        };
    
        if (isMarker) {
          // Marker coordinates
          markerRef.current = [
            extents.ymin,
            extents.xmin
          ];
          positionRef.current = markerRef.current;
          zoomRef.current = 10;
        } else {
          // Rectangle coordinates
          bboxRef.current = [
            [extents.ymin, extents.xmin], // SW corner
            [extents.ymax, extents.xmax]  // NE corner
          ];
          positionRef.current = [
            (extents.ymin + extents.ymax) / 2, // Center lat
            (extents.xmin + extents.xmax) / 2   // Center lng
          ];
          zoomRef.current = 4;
        }
    
        // Prepare metadata for display
        const metadata = {
          title: data.title,
          description: data.abstract || '',
          temporal_coverage_from: data.temporal_coverage_from,
          temporal_coverage_to: data.temporal_coverage_to,
          language: data.language,
          version: data.version,
          is_restricted: String(data.is_restricted),
          createdAt: data.createdAt,
          data_type: data.data_type.datatype_code,
          country: data.country.long_name,
          coordinate_reference_system: data.coordinate_reference_system,
          project: data.project.project_name,
          publisher: data.publisher.name,
          contact: data.contact?.email || '',
          license: data.license,
          topics: data.topics.map(topic => topic.name),
          keywords: data.keywords.map(keyword => keyword.name),
          canonical_url: data.canonical_url || 'N/A',
          west_bounding_box: data.west_bounding_box,
          east_bounding_box: data.east_bounding_box,
          south_bounding_box: data.south_bounding_box,
          north_bounding_box: data.north_bounding_box,
          updatedAt: data.updatedAt,
          created_by: data.created_by
        };
    
        // Update state
        setTable(metadata);
        setinfotext(JSON.stringify(data, null, 2));
        setLoading(true);
        setinfoshow(true);
    
        // Initialize map after short delay
        setTimeout(() => {
          initMap(isMarkerRef.current, markerRef.current, bboxRef.current);
        }, 300);
    
      } catch (error) {
        console.error("Error fetching single record:", error);
        setLoading(true);
        setCss('btn btn-warning');
        setHeader('Error');
        setMessage("Failed to fetch the requested record.");
        setinfoshow22(true);
      }
    };
  
  function rankFormatter(cell, row, rowIndex, formatExtraData) { 
      //console.log(cell)
      return ( 
            < div 
                style={{ textAlign: "center",
                   cursor: "pointer",
                  lineHeight: "normal" }}>
                      
              <MdOutlinePageview  style={{width:"23px",height:"23px"}} onClick={() => {getOneData(row.idx)}}/> 
       </div> 
  ); } 

  const handleTitle = event => {
    titleref.current = event.target.value;
    setTitle(event.target.value);
  };
  
  const handlemetatext = event => {
    setMetadata(event.target.value);
  };
  


const options = {
  custom: true,
  totalSize: obsSource.length
};

function initialize_map(){
    
  baseLayermain.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; Pacific Community (OSM)',
      detectRetina: true
  });
  //console.log('Home Rendered!!');
  mapContainermain.current = null;
  mapContainermain.current = L.map('mapidmain', {
      zoom: 3,
      center: [0.878032, 185.843298]
    });
    
    baseLayermain.current.addTo(mapContainermain.current); 

    var m_drawn_features = new L.FeatureGroup();
    mapContainermain.current.addLayer(m_drawn_features);

   let draw_control = new L.Control.Draw({
    position: 'topleft',
    draw: {
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: true,
        circlemarker: false,
        marker: false,
    },
    edit: {
      featureGroup: m_drawn_features, //REQUIRED!!
      remove: true
  }
});

mapContainermain.current.addControl(draw_control);
layer3.current = addEEZ(mapContainermain.current)
mapContainermain.current.on(L.Draw.Event.CREATED, function(e) {
  // Remove all layers (only show one location at a time)
  m_drawn_features.clearLayers();

  // Add layer with the new features
  let new_features_layer = e.layer;
  m_drawn_features.addLayer(new_features_layer);


 // let new_features_layer = e.layer;
    var extent_def = new_features_layer._bounds._northEast.lat+","+new_features_layer._bounds._southWest.lat+","+new_features_layer._bounds._northEast.lng+","+new_features_layer._bounds._southWest.lng;
    var minx = new_features_layer._bounds._southWest.lng;
    var maxx = new_features_layer._bounds._northEast.lng;
    var miny = new_features_layer._bounds._southWest.lat;
    var maxy = new_features_layer._bounds._northEast.lat;
  setExtent(extent_def);
  extentref.current = "minx="+minx+" maxx="+maxx+" miny="+miny+" maxy="+maxy;
  

});
markersLayer.current = L.featureGroup().addTo(mapContainermain.current).on("click", groupClick);
  }
  function findDuplicateArrayIndices(arrays) {
    const indexMap = new Map();

    arrays.forEach((array, index) => {
        const key = JSON.stringify(array);
        if (!indexMap.has(key)) {
            indexMap.set(key, []);
        }
        indexMap.get(key).push(index);
    });

    const duplicateIndices = [];
    indexMap.forEach((indices) => {
        if (indices.length > 1) {
            duplicateIndices.push(indices);
        }
    });

    return duplicateIndices;
}

function* flattenArray(arr) {
  for (let item of arr) {
      if (Array.isArray(item)) {
          yield* flattenArray(item);
      } else {
          yield item;
      }
  }
}


  function groupClick(event) {
   // console.log(markersLayer.current._layers['57']._bounds);
    //console.log(markersLayer.current._layers['60']._bounds);
    if (datatyperef.current !== 'insitu'){
    var obj = markersLayer.current._layers;
    var result = Object.keys(obj).map((key) => [key, obj[key]]);
    console.log(result);
    var all_bounds = [];
    var ids = [];
    for (var a=0; a<result.length; a++){
      var temp = [];
      var ind =[];
      ind.push(result[a][1].test)
      ind.push(a)
      ids.push(ind)
      temp.push(result[a][1]._bounds._southWest.lat)
      temp.push(result[a][1]._bounds._southWest.lng)
      temp.push(result[a][1]._bounds._northEast.lat)
      temp.push(result[a][1]._bounds._northEast.lng)
      all_bounds.push(temp)
    }
    var commons = findDuplicateArrayIndices(all_bounds); 
    const flatArray = Array.from(flattenArray(commons));
    console.log(flatArray);
    console.log(ids)
    var valid = false;
    for (var b=0; b<ids.length; b++){
      var org_ind = ids[b][1];
      var vool = false
      for (var c=0; c<flatArray.length; c++){
        if (org_ind === flatArray[c]){
          vool = true
        }
      }
      if(!vool){
        if (ids[b][0] === event.layer.test){
          valid = true
        }
      }
    }
    

    if (!valid){
      //setCss('btn btn-warning')
      //setHeader('Warning')
      //setMessage("Some layers maybe intersecting, please use the table below to view metadata.")
      //setinfoshow22(true)
      toast.warning('Use table to view metadata!', {position: toast.POSITION.BOTTOM_RIGHT, autoClose:4000, width:'400px', pauseOnHover:false, closeOnClick:true})
    }
    else{
      getOneData(event.layer.test)
    }
  }
  else{
    getOneData(event.layer.test)
  }
    
 //     console.log(xmin_bool, ymin_bool, xmax_bool, ymax_bool)
  //  console.log(json_obj)

    /*
    var first_layer = markersLayer.current._layers['57']._bounds;
    var second_layer = markersLayer.current._layers['60']._bounds;
    console.log(event.layer.type)
    if (event.layer.type !== 'insitu'){
    if (JSON.stringify(first_layer) === JSON.stringify(second_layer)){
      setCss('btn btn-warning')
            setHeader('Warning')
            setMessage("Some layers maybe overlapping, please use the table below to view metadata.")
            setinfoshow22(true)
    }
    else{
    getOneData(event.layer.test)
    }
  }
  else{
    getOneData(event.layer.test)
  }*/
  }

  function initMap(isMarker, markercoord, bbox){
    
    const BING_KEY = 'AnIOo4KUJfXXnHB2Sjk8T_zV-tI7FkXplU1efiiyTYrlogDKppodCvsY7-uhRe8P'
   
    baseLayer.current = L.tileLayer.bing(BING_KEY, {
      //  maxZoom: 5,
        attribution:
        '&copy; Pacific Community (OSM)',
        detectRetina: true,
      });
/*
      baseLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; Pacific Community (OSM)',
          detectRetina: true
      });*/
      //console.log('Home Rendered!!');
      mapContainer.current = null;
        mapContainer.current = L.map('mapId', {
          zoom: 3,
          center: [0.878032, 185.843298]
        });
        
        baseLayer.current.addTo(mapContainer.current); 

        if (isMarker){
        layer.current = addMarker(mapContainer.current,markercoord,999);
        }
        else{
         // console.log(bbox)
          layer.current = addBBox(mapContainer.current, bbox)
        }

        //MAIN MAPPING
        
     // }

        /*
        var m_drawn_features = new L.FeatureGroup();
   mapContainer.current.addLayer(m_drawn_features);

   let draw_control = new L.Control.Draw({
    position: 'topleft',
    draw: {
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: true,
        circlemarker: false,
        marker: false,
    },
    edit: {
      featureGroup: m_drawn_features, //REQUIRED!!
      remove: true
  }
});

mapContainer.current.addControl(draw_control);

mapContainer.current.on(L.Draw.Event.CREATED, function(e) {
  // Remove all layers (only show one location at a time)
  m_drawn_features.clearLayers();

  // Add layer with the new features
  let new_features_layer = e.layer;
  m_drawn_features.addLayer(new_features_layer);

 // setExtent(new_features_layer)
  console.log(new_features_layer._bounds)
  var extent_def = new_features_layer._bounds._northEast.lat+","+new_features_layer._bounds._southWest.lat+","+new_features_layer._bounds._northEast.lng+","+new_features_layer._bounds._southWest.lng;
  console.log(extent_def)
  setExtent(extent_def);
  extentref.current(extent_def)
  //  console.log('----------');
//   console.log('----------');
//  update_plot(new_features_layer);
});
*/
  }

  useEffect(() => {  

      if (_isMounted.current){
        initialize_map();
        const user = AuthService.getCurrentUserCookie();
        if (user === null || user === undefined){
          setUnauthorized(true);
        }
        else{
          setToken(user.accessToken)
          setUnauthorized(false);
        }
          
        fetchparameters();
        fetchtags();
        fetchtopic();
        fetchcountry();
        fetchdatatype();
        fetchproject();
      }  
      return () => { _isMounted.current = false }; 
      },[]);

    return (
        <div className="container-fluid">
            <main id="bodyWrapper" >
          <div id="mapWrapper" style={{marginLeft:'-9px',marginRight:'-9px'}}>

 <div className="row">
 <div className="col-sm-6" style={{backgroundColor:'#f7f7f7'}} id="map3">
 <div className="row" >
    <div className="col-sm-12">
    <div className="form-group form-select-sm" style={{textAlign:'left'}}>
    <label htmlFor="exampleInputEmail2" >Title</label>
    <input type="email" className="form-control form-select-sm" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Title" onChange={handleTitle} value={title}/>
    </div>
      </div>
      </div>
      <div className="row" style={{marginTop:'0px'}}>
    <div className="col-sm-4">
    <div className="form-group form-select-sm" style={{textAlign:'left'}}>
      <label htmlFor="exampleInputEmail1">Country</label> <span style={{ color: 'red' }}>*</span>
      <select  className="form-select form-select-sm"  id="exampleInputEmail2" aria-label=".form-select-sm example"
              disabled={false}
              value={country}
              onChange={(e) => {
                countryref.current = e.currentTarget.value;
                fitbbox(mapContainermain.current, mayFlyer(e.currentTarget.value))
                setCountry(e.currentTarget.value)
                e.currentTarget.blur();}}
                
                
          >
            <option value="%">-- Select --</option>
              {countrylist.map((item) => (
              <option key={item.short_name} value={item.short_name}>
                  {item.long_name}
              </option>
              ))}
          </select>
    </div>
      </div>
      <div className="col-sm-4">
      <div className="form-group form-select-sm" style={{textAlign:'left'}}>
      <label htmlFor="exampleInputEmail1">Data Type</label> <span style={{ color: 'red' }}>*</span>
      <select  className="form-select form-select-sm"  id="exampleInputEmail2" aria-label=".form-select-sm example"
              value={datatype}
              onChange={(e) => {
                datatyperef.current = e.currentTarget.value;
                setDatatype(e.currentTarget.value)
                e.currentTarget.blur();}}
          >
             <option value="%">-- Select --</option>
              {datatypelist.map((item) => (
              <option key={item.id} value={item.id}>
                  {item.datatype_name}
              </option>
              ))}
          </select>
    </div>

  </div>
  <div className="col-sm-4">
  <div className="form-group form-select-sm" style={{textAlign:'left'}}>
      <label htmlFor="exampleInputEmail1">Project</label>
      <select  className="form-select form-select-sm"  id="exampleInputEmail2" aria-label=".form-select-sm example"
              disabled={false}
              value={project}
              onChange={(e) => {
                projectref.current = e.currentTarget.value;
                setProject(e.currentTarget.value)
                e.currentTarget.blur();}}
          >
            <option value="%">-- Select --</option>
              {projectlist.map((item) => (
              <option key={item.id} value={item.id}>
                  {item.project_name}
              </option>
              ))}
          </select>
    </div>

  </div>
      </div>
      <div className="row" style={{marginTop:'0px'}}>
    <div className="col-sm-6">
    <div className="form-group form-select-sm" style={{textAlign:'left'}}>
      <label htmlFor="exampleInputEmail1">Topic</label>
      <Multiselect
          displayValue="label"
          isObject={true}
          onRemove={(event) => {
            setTopic([{key:'%',label:"%"}])
          }}
          onSelect={(event) => {
            setTopic(event);
          }}
          options={topiclist}
          selectedValues={[{key:0,label:"Ocean Science"}]}
          showCheckbox
          selectionLimit={1}
          avoidHighlightFirstOption 
        />
    </div>
      </div>
      <div className="col-sm-6">
    <div className="form-group form-select-sm" style={{textAlign:'left'}}>
      <label htmlFor="exampleInputEmail1">Keyword</label>
      
      <Multiselect
          displayValue="label"
          isObject={true}
          closeMenuOnSelect={false}
          onRemove={(event) => {
            setTag([{key:'%',label:"%"}]);
          }}
          onSelect={(event) => {
            setTag(event);
          }}
          options={taglist}
          selectedValues={[{key:0,label:"Ocean"}]}
          showCheckbox
          selectionLimit={1}
          avoidHighlightFirstOption
        />
  
    </div>
      </div>
      </div>
      <div className="row" style={{marginTop:'0px'}}>
     
  <div className="col-sm-12">
    <div className="form-group form-select-sm" style={{textAlign:'left'}}>
      <label htmlFor="exampleInputEmail1">Publisher</label> 
      
      <Multiselect
      style={{backgroundColor:'red', color:'red', height:"5px", marginTop:"10px"}}
          displayValue="label"
          isObject={true}
          closeMenuOnSelect={false}
          options={[{key:0,label:"Tuvalu Meteorological Service"}]}
          selectedValues={[{key:0,label:"Tuvalu Meteorological Service"}]}
          showCheckbox
          avoidHighlightFirstOption
        />
  
    </div>
      </div>
      </div>
   
      
      <div className="row" style={{marginTop:'5px'}}>
      <div className="d-flex justify-content-between">
      <div>
         
      </div>
      <div>
         
      <button type="submit" className="btn btn-primary  btn-sm" onClick={getPlayerData}>Search</button>
      </div>
 </div>
 
        </div>
      <br/>
 </div>
 <div className="col-sm-6" id="map"  style={{paddingLeft:'0'}}>
 <div id="mapidmain" style={{ height: '100%', width: '100%' }}></div>

  </div>
 </div>

 <div className="row justify-content-center" style={{height:"50vh"}}>
    <div className="col-sm-12"  style={{padding:'2%', textAlign:'center'}}>
        {loading ? (
                <PaginationProvider
                pagination={ paginationFactory(options) }
                >
                {
                    ({
                    paginationProps,
                    paginationTableProps
                    }) => (
                    <div>
                        <PaginationTotalStandalone 
                        { ...paginationProps }
                        />
                        <PaginationListStandalone
                        { ...paginationProps }
                        />
                        <BootstrapTable
                        keyField="id"
                        data={ obsSource }
                        columns={ columns }
                        hover
                        { ...paginationTableProps }
                        />
                    </div>
                    )
                }
                </PaginationProvider>
        ):(
            <ReactBootStrap.Spinner animation="border" variant="primary"/>
        )}
        </div>
        
        </div>

<br/>
          </div>
      </main>
      <Modal show={infoshow} onHide={handleinfo} size="xl">
  <Modal.Header>
    Metadata 
  </Modal.Header>
  <Modal.Body>
    <div>
      <div id="mapId" style={{height:'250px', width:'100%'}}>
        <img 
          className="edit-location-button" 
          alt='flag' 
          src={countryFlagRef.current} 
          style={{width:"100px", height:"60px"}} 
        />
      </div>
      <br/>
      <Tabs
        defaultActiveKey="home"
        id="metadata-tabs"
        className="mb-3"
      >
        <Tab eventKey="home" title="Tabular-view">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th style={{textAlign:'center', backgroundColor:"#215E95", color:'white', minWidth:'210px'}}>Metadata</th>
                  <th style={{textAlign:'center', backgroundColor:"#215E95", color:'white'}}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Title</td>
                  <td>{table.title}</td>
                </tr>
                <tr>
                  <td>Abstract</td>
                  <td>{table.description}</td>
                </tr>
                <tr>
                  <td>Temporal Coverage From</td>
                  <td>{new Date(table.temporal_coverage_from).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>Temporal Coverage To</td>
                  <td>{new Date(table.temporal_coverage_to).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>Language</td>
                  <td>{table.language}</td>
                </tr>
                <tr>
                  <td>Version</td>
                  <td>{table.version || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Restricted</td>
                  <td>{table.is_restricted}</td>
                </tr>
                <tr>
                  <td>Data Type</td>
                  <td><span className="badge bg-success" style={{fontSize:'14px'}}>{table.data_type}</span></td>
                </tr>
                <tr>
                  <td>Country</td>
                  <td>
                    <img alt='flag' src={countryFlagRef.current} style={{width:"50px", height:"28px"}} /> 
                    &nbsp;{table.country} 
                  </td>
                </tr>
                <tr>
                  <td>Project</td>
                  <td>{table.project}</td>
                </tr>
                <tr>
                  <td>Publisher</td>
                  <td>{table.publisher}</td>
                </tr>
                <tr>
                  <td>Contact</td>
                  <td>{table.contact}</td>
                </tr>
                <tr>
                  <td>Topics</td>
                  <td>
                    {table.topics?.length > 0 ? (
                      table.topics.map(topic => (
                        <span key={topic} className="badge bg-primary" style={{fontSize:'14px', marginRight: '4px'}}>
                          #{topic}
                        </span>
                      ))
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Keywords</td>
                  <td>
                    {table.keywords?.length > 0 ? (
                      table.keywords.map(keyword => (
                        <span key={keyword} className="badge bg-primary" style={{fontSize:'14px', marginRight: '4px'}}>
                          #{keyword}
                        </span>
                      ))
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Bounding Box</td>
                  <td>
                    W: {table.west_bounding_box}, E: {table.east_bounding_box}<br/>
                    S: {table.south_bounding_box}, N: {table.north_bounding_box}
                  </td>
                </tr>
                <tr>
                  <td>CRS</td>
                  <td>
                    <span className="badge bg-warning text-dark" style={{fontSize:'14px'}}>
                      {table.coordinate_reference_system}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Canonical URL</td>
                  <td>
                    {table.canonical_url && table.canonical_url !== 'false' ? (
                      <a href={table.canonical_url} target="_blank" rel="noopener noreferrer">
                        {table.canonical_url}
                      </a>
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>License</td>
                  <td>{table.license}</td>
                </tr>
                <tr>
                  <td>Created At</td>
                  <td>{new Date(table.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Updated At</td>
                  <td>{new Date(table.updatedAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Created By</td>
                  <td>{table.created_by}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Tab>
        <Tab eventKey="profile" title="JSON-view">
          <JSONPretty 
            id="json-pretty" 
            data={infotext} 
            theme={JSONPrettyMon} 
            mainStyle="padding:-10em" 
            valueStyle="font-size:1em"
          />
        </Tab>
      </Tabs>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleinfo}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

      <Modal show={infoshow2} onHide={handleinfo2} size="lg">
    <Modal.Header>
      Information
      </Modal.Header>
      
        <Modal.Body>
          <div>
          <textarea class="form-control full-width" rows="20" placeholder="Metadata details" width="100%" value={metadata} onChange={handlemetatext}>
          {infotext2}
          </textarea>

         </div>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="warning" onClick={handleUpdate}>
            Update
          </Button>
          <Button variant="secondary" onClick={handleinfo2}>
            Close
          </Button>
         
        </Modal.Footer>
      </Modal>
      <Modal show={infoshow22} onHide={handleinfo22} size="lg" centered={true} >
  <Modal.Header className={css} >
      {header}
    </Modal.Header>
      
        <Modal.Body>
          <div>
          {message}
         </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleinfo22}>
            Close
          </Button>
         
        </Modal.Footer>
      </Modal>
      <Modal size="lg" centered={true} >
  <Modal.Header >
      Fake model
    </Modal.Header>
      
        <Modal.Body>
          <div>
          <MapContainer center={[0.878032, 185.843298]} zoom={3} scrollWheelZoom={true} >

</MapContainer>
         </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary">
            Close
          </Button>
         
        </Modal.Footer>
      </Modal>
      </div>
      
    );  
}

export default Home;