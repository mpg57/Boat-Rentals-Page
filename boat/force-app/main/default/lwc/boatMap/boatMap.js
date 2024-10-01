// import BOATMC from the message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { subscribe, MessageContext, APPLICATION_SCOPE, unsubscribe } from 'lightning/messageService';
// import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
//getFieldValue
import { wire, LightningElement, track, api } from 'lwc';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';

const BOAT_FIELDS = [LATITUDE_FIELD, LONGITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @track boatId;
  error = undefined;
  mapMarkers = [];


  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.boatId = value;
  }

  @wire(MessageContext) messageContext;

  connectedCallback() {
    this.subscribeMC();
  }


  subscribeMC() {
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
    // retrieve boat record ID
    this.subscription = subscribe(this.messageContext, BOATMC, 
      (message) => {
        this.boatId = message.recordId;
      }, 
      { scope: APPLICATION_SCOPE }
    );
  }

    // // Getting record's location to construct map markers using recordId
  // // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      const latitude = getFieldValue(data, LATITUDE_FIELD);
      const longitude = getFieldValue(data, LONGITUDE_FIELD);
      this.updateMap(longitude, latitude); 
    } else if (error) {
      this.error = error;
      this.mapMarkers = [];
    }
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(longitude, latitude) {
    this.mapMarkers = [{
      location: { 
        Latitude: latitude, 
        Longitude: longitude 
      }
    }];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}