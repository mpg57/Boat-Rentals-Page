import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

const ERROR_VARIANT = 'error';
const ERROR_TITLE = 'Error loading Boats Near Me';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';

export default class BoatsNearMe extends LightningElement {
    @api boatTypeId; // boat type we are filtering for
    latitude;
    longitude;
    isRendered; // controls loading only once
    mapMarkers = []; // map that holds latitude and longitude for each boat
    isLoading = true; // used for spinner

    // get boats, but filter by boat type (boatTypeId)
    @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    wiredBoatsJSON({error, data}) {
        if (data) {
            this.createMapMarkers(data);
        }
        else if (error) {
            const toast = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.body ? error.body.message : 'An error occurred',
                variant: ERROR_VARIANT
            })
    
            this.dispatchEvent(toast);
        }
        
        this.isLoading = false;
    }

    // runs when page first loads to get user's location
    renderedCallback() {
        if (!this.isRendered) {
            this.getLocationFromBrowser(); // get user's location only once
            this.isRendered = true;
        }
    }

    createMapMarkers(boatData) {
        const newMarkers = JSON.parse(boatData).map(boat => {
            return {
                title: boat.Name,
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s,
                }
            }
          });
      
          // Add the user’s location as the first marker
          newMarkers.unshift({
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER,
            location: {
              Latitude: this.latitude,
              Longitude: this.longitude
            }
          });
      
          this.mapMarkers = newMarkers; // Set the markers on the map
    }

    getLocationFromBrowser() {
        // use javascript to get geolocation (latitude and longitude)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.isLoading = false;
            }, error => {
                const toast = new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: 'Error fetching location from browser',
                    variant: ERROR_VARIANT
                })
        
                this.dispatchEvent(toast);
                this.isLoading = false;
            })
        }
        else {
            const toast = new ShowToastEvent({
                title: ERROR_TITLE,
                message: 'Geolocation is not supported by your browser',
                variant: ERROR_VARIANT
            })
    
            this.dispatchEvent(toast);
            this.isLoading = false;
        }
    }
}