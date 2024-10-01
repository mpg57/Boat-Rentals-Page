import { LightningElement, wire, track } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement {
    @track selectedBoatTypeId = '';

    // Private
    error = undefined;

    searchOptions;

    // Wire a custom Apex , populates the map returning the types names and Ids
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
        console.log('calling wire method')
        if (data) {
            console.log('got data')
            this.searchOptions = data.map(type =>
                ({ label: type.Name, value: type.Id })
            );
            console.log('set search options: ' + this.searchOptions)
            this.searchOptions.unshift({ label: 'All Types', value: '' });
            console.log('this.searchOptions in getBoatTypes: ' + this.searchOptions)
        } else if (error) {
            console.log('got error')
            this.searchOptions = undefined;
            this.error = error;
            console.log('found an error in boatTypes() ' + this.error)
        }
    }

    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        this.selectedBoatTypeId = event.detail.value;
        const searchEvent = new CustomEvent('search', { detail: { boatTypeId: this.selectedBoatTypeId } });
        this.dispatchEvent(searchEvent);
    }
}