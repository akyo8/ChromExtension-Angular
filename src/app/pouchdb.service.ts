import { Injectable, EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb-browser';

@Injectable()
export class PouchdbService {

    private isInstantiated: boolean;
    private database: any;
    private listener: EventEmitter<any> = new EventEmitter();

    public constructor() {
        if(!this.isInstantiated) {
            this.database = new PouchDB("extension");
            this.isInstantiated = true;
        }
    }

    public fetch() {
        return this.database.allDocs({include_docs: true});
    }

    public remove(id: string){
        return this.get(id).then(result => {
            return this.database.remove(result);
        }, error => {
            if(error.status == "404"){
                return this.database.remove(id);
            } else {
                return new Promise((resolve, reject) =>{
                    reject(error);
                });
            }
        });
    }

    public get(id: string) {
        return this.database.get(id);
    }

    public put(id: string, document: any) {
        document._id = id;
        return this.get(id).then(result => {
            document._rev = result._rev;
            return this.database.put(document);
        }, error => {
            if(error.status == "404") {
                return this.database.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    public sync(remote: string) {
        let remoteDatabase = new PouchDB(remote);
        this.database.sync(remoteDatabase, {
            live: true
        }).on('change', change => {
            this.listener.emit(change);
        }).on('error', error => {
            console.error(JSON.stringify(error));
        });
    }

    public getChangeListener() {
        return this.listener;
    }

}
