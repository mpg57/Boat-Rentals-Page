import { LightningElement, wire, api } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { subscribe, publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';


export default class BoatSearchResults extends LightningElement {
    @api selectedBoatId;
    columns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Length', fieldName: 'Length__c', editable: true },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
        { label: 'Description', fieldName: 'Description__c', editable: true }
    ];
    boatTypeId = '';
    boats;
    isLoading = false;
    draftValues = [];

    // wired message context
    @wire(MessageContext) messageContext;

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }

    @wire (getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats({data, error}) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        if (data) {
            this.boats = data;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        }
        else if (error) {
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        }

    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() { 
        // todo
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        
        await refreshApex(this.boats)
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    // this is the parent, receiving a selected boat 'event' from the child 'tile', when a tile is clicked
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        console.log('selectedboatId: ' + this.selectedBoatId)
        this.sendMessageService(this.selectedBoatId)
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        // explicitly pass boatId to the parameter recordId
        console.log('publishing selected boat Id: ' + this.selectedBoatId)
        publish(this.messageContext, BOATMC, {recordId: boatId});
        console.log('finished publish')
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        // notify loading
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({ data: updatedFields })
            .then(() => { 
                const evt = new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT,
                });
                this.dispatchEvent(evt);
                this.draftValues= [];
                refreshApex(this.boats);
            })
            .catch(error => { 
                const evt = new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: 'Error updating boat list',
                    variant: ERROR_VARIANT,
                });
                this.dispatchEvent(evt);
            })
            .finally(() => { });
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        const event = isLoading ? 'loading' : 'doneLoading';
        
        // dispatch either 'loading' or 'doneLoading'
        const loadEvent = new CustomEvent(event);
        this.dispatchEvent(loadEvent);
    }
}