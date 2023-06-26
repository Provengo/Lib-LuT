/* 
 - row validation (column count etc)
 - ranges should match sub-ranges: [10,100].match([11,34]) b/c any value in [11,34] is in [10,100]
 - add a list of values (e.g. LUT.List("a","B","CCC") );
 - expected values that are calculations of the in-values.
*/


const LUT = (function(){
    const sampleValue=function(){ return this.values()[0]; };

    const ANY = { 
        match: function(e){ return true; }, 
        values:function(){ return [0];} 
    };
    ANY.toString = function(){ return "«*»"; };
    ANY.sampleValue = sampleValue;

    function ExactMatcher( tgt ){
        this.targetValue = tgt;
        this.match = function(v){
            return v===this.targetValue;
        }
        this.values = function(){ return [this.targetValue]};
    }
    ExactMatcher.prototype.toString = function(){
        return `«=${this.targetValue}»`;
    }
    ExactMatcher.prototype.sampleValue = sampleValue;
    
    function RangeMatcher( start, end ){
        this.start = start;
        this.end = end;
        this.match = function(v) {
            v = Number(v);
            if ( isNaN(v) ) {
                return false;
            } else {
                return v>=start && v<= end;
            }
        }
        this.values = function(){ return [this.start, (this.end-this.start)/2+this.start, this.end];}
    }
    RangeMatcher.prototype.toString = function(){
        return `«${this.start}..${this.end}»`;
    }
    RangeMatcher.prototype.sampleValue = function(){this.values()[1]};
    
    function convertToArray( obj, cols ) {
        const retVal = [];
        for ( let cIdx in cols ) {
            retVal.push( obj[cols[cIdx]] );
        }

        return retVal;
    }

    /**
     * Pre-process input so we always have an array-like object of matchers
     * @param {*} inputRowPart obj/array
     * @returns standardized array like object
     */
    function processRowPart( inputRowPart, cols ) {
        let outArr = [];
        if ( ! Array.isArray(inputRowPart) ) {
            inputRowPart = convertToArray(inputRowPart, cols);
        }
        for ( let i=0; i<inputRowPart.length; i++ ){
            switch( typeof inputRowPart[i] ) {
                case "number":
                case "string":
                case "boolean":
                    outArr.push( new ExactMatcher(inputRowPart[i]) );
                    break;
                case "function":
                    outArr.push( inputRowPart[i] );
                    break;
                case "object":
                    if ( (typeof inputRowPart[i].match) != "function" ) {
                        throw "Unsupported LUT value " + inputRowPart[i] + " of needs to have a match(e):boolean function.";    
                    }
                    outArr.push(inputRowPart[i]);
                    break;
                default:
                    throw "Unsupported LUT value " + inputRowPart[i] + " of type " + (typeof inputRowPart[i]) + " at index " + i;
            }
        }
        
        // expose row part values by name as well
        for ( let cIdx in cols ) {
            outArr[cols[cIdx]] = outArr[cIdx];
        }
        return outArr;
    }

    function makeRow( inRow, props ){
        return {
            ins: processRowPart(inRow.ins, props.ins),
            outs: processRowPart(inRow.outs, props.outs)
        };
    }

    function lookup(rows, qry) {
        if ( ! qry ) throw new "LUT error: got a null-ish query";
        for ( let rowIdx = 0; rowIdx < rows.length; rowIdx++ ) {
            let row = rows[rowIdx];
            let ins = row.ins;
            let matchOK = true;
            for ( let mIdx=0; mIdx<ins.length && matchOK; mIdx++ ) {
                matchOK = ins[mIdx].match(qry[mIdx]);
            }
            if ( matchOK ){
                return row.outs;
            }
        }
        return LUT.NoMatch;
    }

    function generateLutEvents(rows, props){
        const cases = [];
        for ( let rowIdx=0; rowIdx<rows.length; rowIdx++ ){
            let row = rows[rowIdx];
            let inArgs = row.ins.map( m => m.values() );
            genCases(inArgs, [], cases);
        }
        cases.forEach( aCase => {
            props.ins.forEach( (p,i)=> aCase[p]=aCase[i] );
        });
        const outArr = cases.map(arr => bp.Event(arr.join(), {
            ins:arr,
            lib:"LUT",
            name:props.name
        }));
        return outArr;
    }
    
    function genCases( valuesArr, acc, outArr ){
        if ( valuesArr.length === 0 ) {
            outArr.push(acc.slice()); // push a copy of the accumulator to the end result.
    
        } else {
            let curArr = valuesArr[0]
            for ( let i=0; i<curArr.length; i++ ) {
                acc.push( curArr[i] );
                genCases(valuesArr.slice(1), acc, outArr);
                acc.pop();
            }
        }
    }

    function create(props) {
        let rows = [];
        return {
            name: props.name,
            insTitles: props.in,
            outsTitles: props.outs,
            rows: rows,
            addRow: function(newRow){ rows.push(makeRow(newRow, props)); },
            lookup: function(ins){ return lookup(rows, ins)},
            generateLutEvents: function(){ return generateLutEvents(rows, props);}
        };
    }

    return {
        create: create,
        ANY: ANY,
        Range: function(s,e){ return new RangeMatcher(s,e);},
        NoMatch: false,
    };
})();



