// @provengo summon ctrl
// @provengo summon constraints

// #region LUT SETUP
const myLut = new LUT({
    name: "Test",
     ins: ["alpha", "beta", "gamma"],
    outs: ["x","y"]
});

myLut.addRow({ ins:[1, 2      , LUT.ANY        ], outs:[3              , LUT.ANY ,"r1"] });
myLut.addRow({ ins:[7, LUT.ANY, 8              ], outs:[LUT.Range(7,14), 19      ,"r2"] });
myLut.addRow({ ins:[4, 2      , LUT.Range(2,4) ], outs:[9              , 99      ,"r3"] });
// #endregion


bthread("testLut", function(){

    // let f = myLut.lookup([1,2,4]);
    // request( bp.Event("exp: r1", f) );
    // f = myLut.lookup([1,2,0]);
    // request( bp.Event("exp: r1", f) );
    // f = myLut.lookup([7,2,8]);
    // request( bp.Event("exp: r2", f) );
    // f = myLut.lookup([8,2,0]);
    // request( bp.Event("exp: not found", f) );

    // f = myLut.lookup([4,2,2]);
    // request( bp.Event("exp: r3", f[2]) );
    // f = myLut.lookup([4,2,3]);
    // request( bp.Event("exp: r3", f[2]) );
    // f = myLut.lookup([4,2,4]);
    // request( bp.Event("exp: r3", f[2]) );
    // f = myLut.lookup([4,2,5]);
    // request( bp.Event("exp: NOT_FOUND", f) );

    let useCase = request(myLut.generateLutEvents());
    let expected = myLut.lookup(useCase.data.values);
    request( bp.Event("Expecting: " + expected.join(", ")));
    
});
