import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { PouchdbService } from "./pouchdb.service";
import { Ng4FilesStatus, Ng4FilesSelected } from './angular4-files-upload';
import { DbnamedialogComponent } from './dbnamedialog/dbnamedialog.component'; 
import { MatDialog, MatTableDataSource, MatSort } from '@angular/material';
import { DbStructure, TableDataStructure, AnalysisDataStructure } from './dbstructure';
import { Stat } from './config/Stat';
// const toFile = require('data-uri-to-file');

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'] 
})
export class AppComponent implements OnInit {

    @ViewChild('analysissort') analysissort: MatSort;

    @ViewChild('filesort') filesort: MatSort;
    
    public people: Array<any>;
    public form: any;
    public selectedFiles;

    public indexDbList:Array<Array<any>>;
    public indexDbLength : number = 0;
    public indexDbName : string = "AAAA";
    selectedIndexDbName : string = "";
    indexDbHeader : any;
    public indexDbContent : DbStructure;  // temporary index Db Content

    analysisStructure : Array<AnalysisDataStructure>;
    analysisdataSource : any;
    analysisColumns = ['form','freq','total','spec'];

    tableStructure : TableDataStructure[];
    filedataSource : any;
    displayedColumns = ['url', 'type', 'token', 'content', 'date'];    
    selectedRow : TableDataStructure;
    selectedAnalysisRow : AnalysisDataStructure;
    flag : boolean = false;    
    dbfullcontent : any;

    public constructor(private database: PouchdbService, private zone: NgZone, public dialog : MatDialog, private ref:ChangeDetectorRef) {
        // this.filesort=new MatSort();
        // this.filesort.active = "url";

        // this.analysissort=new MatSort();
        // this.analysissort.active = "form";

        this.indexDbContent = new DbStructure();
        // this.tableStructure = [];
        // this.filedataSource = new MatTableDataSource<TableDataStructure>(this.tableStructure);
        this.dbfullcontent = [];
        this.analysisStructure = [];
        this.indexDbList = [];
        this.indexDbLength = 0;
        this.people = [];
        this.indexDbHeader = {
            "pages" : 0,
            "types": 0,
            "tokens" : 0,
            "date" : "2017-01-01"
        };
        this.form = {
            "username": "",
            "firstname": "",
            "lastname": ""
        }
    }

    public ngOnInit() {
        // this.database.sync("http://localhost:4984/extension");

        this.database.getChangeListener().subscribe(data => {
            let ii = this.indexDbLength;
            for(let i = 0; i < data.change.docs.length; i++) {
                this.zone.run(() => {
                    if(ii % 4 == 0) this.indexDbList.push([]);
                    this.indexDbList[Math.floor(ii / 4)].push(data.change.docs[i]);
                    ii++;
                });
            }
        });
        this.database.fetch().then(result => {
            for(let i = 0; i < result.rows.length; i++) {
                if(i % 4 == 0) this.indexDbList.push([]);
                this.indexDbList[Math.floor(i / 4)].push(result.rows[i].doc);
            }
            this.indexDbLength = result.rows.length;
            if(this.indexDbLength != 0){
                this.selectedIndexDbName = this.indexDbList[0][0].dbname;
                this.getTableStructure(this.indexDbList[0][0]);
            }
        }, 
        error => {
            console.error(error);
        });
    }

    public onAnalysisTableRowSelect(event){
        console.log("AnalysisTable");
    }

    public onTableRowSelect(row : any){
        this.selectedRow = row;
        this.analysisStructure = [];
        let stat : any;
        let res = this.selectedRow.fullcontent;
        stat = new Stat(this.dbfullcontent, 5);
        // let selection=(new Array<number>(parts.length)); // selection=[0,1];  
        // for (let i = 0; i < selection.length; i++)
        //    selection[i] = i;
        let selection=[row.id-1];
        var specobjects = stat.selectiontypes(selection).map(function(ty){ 
		    return Object.assign({type:ty}, stat.selectionSpec(selection,ty)); 
        });
        // console.log(specobjects);
        specobjects.sort(function(a, b) {return b.specInSel - a.specInSel;})
       
        for(var i = 0; i < specobjects.length; i++){
            let temp : AnalysisDataStructure;
            temp = new AnalysisDataStructure();
            
            if(specobjects[i]["type"].length > 15)
                temp.form = specobjects[i]["type"].slice(0,15) + '...';
            else
                temp.form = specobjects[i]["type"];
            temp.freq = specobjects[i]["freqInSel"];
            temp.total = specobjects[i]["totalFreqOfTok"];
            let num = specobjects[i]["specInSel"];
            temp.spec = num.toPrecision(8);
            this.analysisStructure = [...this.analysisStructure, temp];
        }

        // Get the Analysis Table Data.

        this.analysisdataSource = new MatTableDataSource<AnalysisDataStructure>(this.analysisStructure);
        this.analysisdataSource.sortingDataAccessor = (data: AnalysisDataStructure, property: string) => {
            switch (property) {
              case 'form': return data.form;
              case 'spec': return +data.spec;
              case 'total': return +data.total;
              case 'freq': return +data.freq;
              default: return '';
            }
        };
        this.analysisdataSource.sort = this.analysissort;
        // console.log(this.analysisStructure);
    }

    public getTableStructure(temp : DbStructure){
        // console.log("Table Structure Function");
        
        //Clear TableStructure Data
        this.tableStructure = [];
        this.dbfullcontent = [];
        this.flag = false;
        let types = 0;
        let token = 0;
        let length = temp.datauri.length;
        let count = length;
        for(var i = 0; i < length; i++){
            let item;
            item = new TableDataStructure();
            
            if(temp.filename[i].length < 80)
                item.url = temp.filename[i];
            else
                item.url = temp.filename[i].slice(0,39) + '......' + temp.filename[i].slice(temp.filename[i].length - 40, temp.filename[i].length);
            item.date = temp.date[i];
            const dataURI = temp.datauri[i];
            const fileReader = new FileReader();
            fileReader.onload = () => {
                count--;
                var res;
                res = fileReader.result;
                item.fullcontent = res;
                let tempstat : any;
                tempstat = new Stat(res.replace(/\/?\<.*\>/g," ").replace(/\s+/g," ").split(/§/), 5);
                item.type = tempstat.nbtypes;
                item.token= tempstat.nbtokens;
                item.id = length - count;
                this.dbfullcontent.push(res.replace(/\/?\<.*\>/g," ").replace(/\s+/g," "));
                if(res.length < 20){
                    item.content = res;
                } else {
                    item.content = res.slice(0, 19) + "....";
                }
                if( count != 0) this.tableStructure.push(item);
                else if(count == 0){
                    let stat : any;
                    stat = new Stat(this.dbfullcontent, 5);
                    this.indexDbHeader["types"] = stat.nbtypes;
                    this.indexDbHeader["token"] =stat.nbtokens;
                    this.tableStructure = [...this.tableStructure, item];
                    // console.log(this.tableStructure);
                    this.filedataSource = new MatTableDataSource<TableDataStructure>(this.tableStructure);
                    this.filedataSource.sortingDataAccessor = (data: TableDataStructure, property: string) => {
                        switch (property) {
                          case 'url': return data.url;
                          case 'type': return +data.type;
                          case 'token': return +data.token;
                          case 'content': return data.content;
                          case 'date': return data.date;                          
                          default: return '';
                        }
                    };
                    this.filedataSource.sort = this.filesort;

                    this.onTableRowSelect(this.selectedRow);
                   
                    // console.log(this.filedataSource);
                }
                // console.log(...this.tableStructure);
                if(!this.flag){
                    this.selectedRow = this.tableStructure[0];
                    console.log(this.selectedRow);
                }
                this.flag = true;
            }
            this.indexDbHeader["pages"] = length;
            fileReader.readAsText(this.dataURItoBlob(dataURI, true));
        }
        this.indexDbHeader = {
            types,
            token,
            length,
            date : this.timestampToDate(Date.now())
        }
    }

    openDialog(): void {
        let dialogRef = this.dialog.open(DbnamedialogComponent, {
          width: '350px',
          data: { dbname: this.indexDbName }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.indexDbName = result;
            console.log(this.indexDbName);

            //Save to Database

            if(this.indexDbLength % 4 == 0)
                this.indexDbList.push([]);
            console.log("Count of Row: ",Math.floor(this.indexDbLength / 4));

            this.indexDbContent.dbname = this.indexDbName;

            let temp : DbStructure;
            temp = new DbStructure();
            this.CopyDbStructure(this.indexDbContent, temp);
            this.database.put(temp.dbname, temp);
            this.indexDbList[Math.floor(this.indexDbLength / 4)].push(temp);

            this.indexDbLength += 1;
            this.selectedIndexDbName = this.indexDbName;

            this.indexDbHeader = {
                "pages" : 0,
                "types": 0,
                "tokens" : 0,
                "date" : "2017-01-01"
            };
            this.getTableStructure(temp);
        });
    }

    CopyDbStructure(from : DbStructure, copyTo: DbStructure){
        copyTo.dbname = from.dbname;
        for(var i = 0; i < from.datauri.length; i++){
            copyTo.filename.push(from.filename[i]);
            copyTo.datauri.push(from.datauri[i]);
            copyTo.date.push(from.date[i]);
        }
    }

    public ClearIndexDbContent(){
        this.indexDbContent.dbname = '';
        this.indexDbContent.datauri = [];
        this.indexDbContent.filename = [];
        this.dbfullcontent = [];
    }

    public onIndexDbDelete(){
        if(confirm("Are you sure want to delete your Database?")){
            if(this.indexDbLength == 0){
                alert("You didn't have any Database");
            } else {
                let result : Array<Array<any>>;
                let i = 0, j = 0, ii = 0;
                result = [];
                for(i = 0; i < this.indexDbList.length; i++){
                    for(j = 0; j < this.indexDbList[i].length; j++){
                        if(ii % 4 == 0) result.push([]);
                        if(this.indexDbList[i][j].dbname != this.selectedIndexDbName){
                            result[Math.floor(ii / 4)].push(this.indexDbList[i][j]);
                            ii ++;
                        }
                    }
                }
                console.log('======================');
                console.log(result);
                this.indexDbList = result;
                this.indexDbLength -= 1;
                this.database.remove(this.selectedIndexDbName);            
                if(this.indexDbLength != 0)
                    this.selectedIndexDbName = result[0][0].dbname;
            }
        }
    }

    public filesSelect(selectedFiles: Ng4FilesSelected): void {
        if (selectedFiles.status !== Ng4FilesStatus.STATUS_SUCCESS) {
            this.selectedFiles = selectedFiles.status;
            return;
            // Hnadle error statuses here
        }
        this.ClearIndexDbContent();

        for(var i = 0; i < selectedFiles.files.length; i++)
        {
            if(selectedFiles.files[i].type == "text/plain" && selectedFiles.files[i].webkitRelativePath.split('/').length == 2){
                console.log(selectedFiles.files[i])
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    // console.log(fileReader.result);
                    let dataURI = fileReader.result;
                    // console.log(this.dataURItoBlob(dataURI, true));
                    this.indexDbContent.datauri.push(dataURI);
                }
                this.indexDbContent.date.push(this.timestampToDate(selectedFiles.files[i].lastModifiedDate));
                this.indexDbContent.filename.push(selectedFiles.files[i].name);
                // console.log(fileReader.readAsDataURL(selectedFiles.files[i]));
                // fileReader.readAsText(selectedFiles.files[i]);
                fileReader.readAsDataURL(selectedFiles.files[i]);
            }
        }
        console.log('=================', this.indexDbContent);
        this.selectedFiles = Array.from(selectedFiles.files).map(file => file.webkitRelativePath);
        // console.log(this.selectedFiles);
     
        //The Db name dialog open.
        this.indexDbName = this.selectedFiles[0].split('/')[0];
        this.openDialog();
    }

    public onIndexDbClick(item : any){
        this.selectedIndexDbName = item.dbname;
        this.getTableStructure(item);
        console.log(item);
    }

    public insert() {
        if(this.form.username && this.form.firstname && this.form.lastname) {
            this.database.put(this.form.username, this.form);
            this.form = {
                "username": "",
                "firstname": "",
                "lastname": ""
            }
        }
    }

    public dataURItoBlob(dataURI, toFile) {
        // get the base64 data
        var data = dataURI.split(',')[1];

        // user may provide mime type, if not get it from data URI
        var mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];
      
        // default to plain/text if data URI has no mimeType
        if (mimeType == null) {
          mimeType = 'plain/text';
        }
        var binary = atob(data);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }

        // Convert to a File?
        if (toFile) {
          return new File([new Uint8Array(array)], '', { type: mimeType });
        }
        return new Blob([new Uint8Array(array)], { type: mimeType });
    }

    timestampToDate(timestamp) :string{
        var t = new Date(timestamp);
        return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate();
    }
}
