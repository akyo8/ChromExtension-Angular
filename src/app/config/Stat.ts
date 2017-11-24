/*!
 * Copyright 2017, Serge Fleury et Kim Gerdes
 *
 * This program is free software:
 * Licensed under version 3 of the GNU Affero General Public License (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at http://www.gnu.org/licenses/agpl-3.0.html
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and limitations under the License. 
 *
 */




const splittertext = "[^\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w]+";

const splitter = new RegExp(splittertext);
const beginSplit = new RegExp("^"+splittertext);
const endSplit = new RegExp(splittertext+"$");


///////////////////////// the Stat class ///////////////////////////
////////////////////////////////////////////////////////////////////
export class Stat {
	specific : number;
	section : any;
	sectionsize : any;
	sectiontokens : any;
	sectiontypes : any;
	freqtotal : any; // token -> freqtotal. gives the total frequency of the token (frequency in all sections combined)
	sectiontokensfreq : any;
	nbtypes=0;
	nbtokens=0;
	selectionspecstore : any;
	sectokfreq : any;
	selectionsize : any;
	selectiontypes : any;
	selection : any;
	selectionSpec : any;
	CalcCoeffSpec : any;
	HyperG : any;
	LogFac : any;
	constructor(sectionArray, specific){
		this.specific=specific;
		this.section={};
		this.sectionsize={};
		this.sectiontokens={};
		this.sectiontypes={};
		this.sectionsize={};
		this.freqtotal={}; // token -> freqtotal. gives the total frequency of the token (frequency in all sections combined)
		this.sectiontokensfreq={};
		this.nbtypes=0;
		this.nbtokens=0;
		for (let sectNum in sectionArray)
		{
			this.section[sectNum]=sectionArray[sectNum];
			this.sectiontokensfreq[sectNum]={};
			sectionArray[sectNum]=sectionArray[sectNum].replace(beginSplit,"");
			sectionArray[sectNum]=sectionArray[sectNum].replace(endSplit,"");
			var tokens=sectionArray[sectNum].split(splitter);
			this.sectiontokens[sectNum]=tokens;
			this.sectiontypes[sectNum]=Array.from(new Set(tokens));
			this.sectionsize[sectNum]=tokens.length;
			for (let tok of tokens)
			{
				this.nbtokens += 1;
				if (!this.freqtotal[tok]) this.freqtotal[tok] = 0;
				this.freqtotal[tok] += 1;
				if (!this.sectiontokensfreq[sectNum][tok]) this.sectiontokensfreq[sectNum][tok] = 0;
				this.sectiontokensfreq[sectNum][tok] += 1;
			}
		}
		this.nbtypes=Object.keys(this.freqtotal).length;
		this.selectionspecstore={};
		this.sectokfreq = function (sectNum, tok)
		{
			return this.sectiontokensfreq[sectNum][tok];
		};
		
		this.selectionsize = function(selection) // Array of section numbers -> size	
		{
			var size=0;
			for (let sectNum in selection) 
			{
				size+=this.sectionsize[sectNum];
			}
			return size;
		};
		
		this.selectiontypes = function(selection)
		{
			var that = this; 
			var tokenarrays = selection.map(function(sectNum)
			{ 
				return that.sectiontypes[sectNum];
			});
			return Array.from(new Set([].concat.apply([], tokenarrays)));
		};
		
		this.selection = function(selection) // Array of section numbers -> text of all sections in selection	
		{
			var text="";
			for (let sectNum in selection) 
			{
				text+=this.section[sectNum]+"\n";
			}
			return text;
		};
		
		this.selectionSpec = function(selection, tok) // Array of section numbers -> (freqInSel, totalFreqOfTok, specInSel )
		{
			
			var selcode=(selection.concat(tok)).join('-');
			if (selcode in this.selectionspecstore) return this.selectionspecstore[selcode];
			var freqInSel=0;
			var totalFreqOfTok=this.freqtotal[tok];
			for (let sectNum in selection) 
			{
				freqInSel+=(this.sectiontokensfreq[sectNum][tok]||0);
			}
			var fts={freqInSel:freqInSel,
				totalFreqOfTok:totalFreqOfTok, 
				specInSel:this.CalcCoeffSpec(this.nbtokens, this.selectionsize(selection), totalFreqOfTok, freqInSel, this.specific)}
			this.selectionspecstore[selcode]=fts;
			return fts;
		};
		
		this.CalcCoeffSpec = function (T,t,F,f,seuilS) 
		{
			if ( (f>t) || (F>T)) return 0;
			var positif=1;
			var zn;
			var p;
			var pp=0;
			var coeff;
			pp=this.HyperG(T, t, F, f);
			seuilS=seuilS/100;
			// if (pp > seuilS) {
			// 		return 0;
			// }
			p=pp;
			if ( f < (((F+1)*(t+1))/(T+2)))  { 
					positif=0;  
					for ( zn= f ; zn > 0 ; zn--) {
						p= (p * zn * (T-F-t+zn))/((F-zn+1) * (t-zn+1.));
						pp+=p;
						// if (pp > seuilS) { return 0;}
						if ( p < 0.0000000001) { break}
					}
			}
			else    { 
					for (zn= f;zn < F; zn++) {
						p = (p * (F-zn) * (t-zn))/((zn+1) * (T-F-t+zn+1.));
						pp+=p;
						// if (pp > seuilS) { return 0}
						if ( p < 0.0000000001) {  break}
					}
			}
				/* MODIF MARS 2017 
			if (pp > 0) { */
				coeff=(Math.log(pp)/Math.log(10))-1;
				if (positif == 1)  { coeff = coeff*(-1); }
				/*}*/
			return (coeff);
		};
		
		this.HyperG = function(T,t,F,f) 
		{
			var z, z1, z2, z3, z4, z5, z6, z7;
			z1=this.LogFac(T);
			z2=this.LogFac(T-t);
			z3=this.LogFac(t);
			z4=this.LogFac(T-F);
			z5=this.LogFac(F);
			z6=z4-z1;
			z7=z6+z2;
			z=z7-this.LogFac(T-F-t+f);
			if (f == 0.) { 
				return(Math.exp(z));
			}
			z=z+z5+z3-this.LogFac(f)-this.LogFac(F-f)-this.LogFac(t-f);
			return(Math.exp(z));
		};
		
		this.LogFac = function(n) 
		{
			if (n > 33 ) {
				return(n*Math.log(n)-n+(Math.log(2.e0*(3.141592653589793)*n))/2.e0+1.e0/(12.e0*n)) ;
			}
			var z=1.e0;
			for (var i= 2; i <= n; i++) {
				z=z*i;
			}
			return(Math.log(z));
		}
	}
	
}
		
	//-----------------------------------------------------------------------------------
	// FONCTIONS SPECIFS
	//-----------------------------------------------------------------------------------
	// function precise_round(num,decimals){
	// 	return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
	// } 
	//-----------------------------------------------------------------------------------
	
	
	
