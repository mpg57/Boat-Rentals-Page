import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// imports
export default class BoatSearch extends NavigationMixin(LightningElement) {
    isLoading = false;
    @track selectedBoatTypeId;

    // Handles loading event
    handleLoading() {
        this.isLoading = true;
    }

    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false;
    }

    // Handles search boat event
    // This custom event comes from the form
    // searchBoats(event) {
    searchBoats(event) {
        // search for boats
        const boatTypeId = event.detail.boatTypeId;
        
        this.handleDoneLoading()

        const boatSearchResults = this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);
        if (boatSearchResults) {
            this.handleDoneLoading();
        }

    }

    // Uses the NavigationMixin extension to open a standard form so the user can create a new boat record.
    createNewBoat(event) {
        this[NavigationMixin.Navigate]({
            type:'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        })
    }
}