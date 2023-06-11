/* TODO next features
 - named parameters in ins and outs, not just positional (i.e. objects, not arrays)
 - row validation (column count etc)
 - ranges should match sub-ranges: [10,100].match([11,34]) b/c any value in [11,34] is in [10,100]
 - add a list of values (e.g. LUT.List("a","B","CCC") );
*/

function ExactMatcher( tgt ){
    this.targetValue = tgt;
    this.match = function(v){
        return v===this.targetValue;
    }
    this.values = function(){ return [this.targetValue]};
}
// TODO: range generation strategies
// TODO: add list matchers
// TODO: Allow access via names and indices (array-like)
// TODO: allow expected values that are calculations of the in-values.

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
ExactMatcher.prototype.toString = function(){
    return `«=${this.targetValue}»`;
}

const ANY = { match: function(e){ return true; }, values:function(){ return [0];} };
ANY.toString = function(){ return "«*»"; };

function parseInArr( inArr ) {
    let outArr = [];
    for ( let i=0; i<inArr.length; i++ ){
        switch( typeof inArr[i] ) {
            case "number":
            case "string":
            case "boolean":
                outArr.push( new ExactMatcher(inArr[i]) );
                break;
            case "function":
                outArr.push( inArr[i] );
                break;
            case "object":
                if ( (typeof inArr[i].match) != "function" ) {
                    throw "Unsupported LUT value " + inArr[i] + " of needs to have a match(e):boolean function.";    
                }
                outArr.push(inArr[i]);
                break;
            default:
                throw "Unsupported LUT value " + inArr[i] + " of type " + (typeof inArr[i]);
        }
    }
    return outArr;
}

function addRow( inRow ){
    // TODO validate column counts etc.
    
    let readyRow = {
        ins: parseInArr(inRow.ins),
        outs: parseInArr(inRow.outs)
    };
    // TODO readyRow should have an API to validate arrays/objects. Also, should have a name-based access to fields as well.

   return readyRow;
}

function lookup(rows, qry) {
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

function generateLutEvents(rows){
    const cases = [];
    for ( let rowIdx=0; rowIdx<rows.length; rowIdx++ ){
        let row = rows[rowIdx];
        let inArgs = row.ins.map( m => m.values() );
        genCases(inArgs, [], cases);
    }
    const outArr = cases.map(arr => bp.Event(arr.join(), {values:arr}));
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

function LUT(props) {
    let rows = [];
    return {
        name: props.name,
        insTitles: props.in,
        outsTitles: props.outs,
        rows: rows,
        addRow: function(newRow){ rows.push(addRow(newRow)); },
        lookup: function(ins){ return lookup(rows, ins)},
        generateLutEvents: function(){ return generateLutEvents(rows);}
    }
}

LUT.ANY = ANY;
LUT.Range = function(s,e){ return new RangeMatcher(s,e);};
LUT.NoMatch = false;