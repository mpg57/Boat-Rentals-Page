// imports
import { LightningElement, api } from "lwc";
export const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
export const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;

    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() {
        return 'background-image:url('+ this.boat.Picture__c +')';
    }

    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() {
        if (this.selectedBoatId === this.boat.Id) {
            return TILE_WRAPPER_SELECTED_CLASS;
        }
        return TILE_WRAPPER_UNSELECTED_CLASS;
    }

    // Fires event with the Id of the boat that has been selected.
    selectBoat() {
        this.selectedBoatId = this.boat.Id;

        // custom event that gets sent to boatSearchResults, using the message service
        // messageContext needs to get wired in the boatSearchResults component in order to publish the message
        const boatSelectEvent = new CustomEvent('boatselect', { detail: { boatId: this.selectedBoatId } });
        this.dispatchEvent(boatSelectEvent);
        console.log('dispatched click event')
    }
}