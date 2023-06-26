// @provengo summon ctrl
// @provengo summon constraints

// #region LUT SETUP
const myLut = LUT.create({
    name: "Test",
     ins: ["alpha", "beta", "gamma"],
    outs: ["x","y","z"]
});

myLut.addRow({ ins:[1,  2      , LUT.ANY        ], outs:[3              , LUT.ANY ,"r1"] });
myLut.addRow({ ins:[7,  LUT.ANY, 8              ], outs:[LUT.Range(7,14), 19      ,"r2"] });
myLut.addRow({ ins:[4,  2      , LUT.Range(2,4) ], outs:[9              , 99      ,"r3"] });
myLut.addRow({ ins:[10, 7      , LUT.ANY        ], outs:{x:700, y:800, z:450} });
myLut.addRow({ ins:{alpha:10, beta:LUT.ANY, gamma:"ping"}, outs:{x:700, y:"pong", z:""} });
// #endregion


bthread("testLut", function(){

     let f = myLut.lookup([1,2,4]);
     request( bp.Event("exp: r1", f) );
     f = myLut.lookup([1,2,0]);
     request( bp.Event("exp: r1", f) );
     f = myLut.lookup([7,2,8]);
     request( bp.Event("exp: r2", f) );
     f = myLut.lookup([8,2,0]);
     request( bp.Event("exp: not found", f) );
     f = myLut.lookup([4,2,2]);
     request( bp.Event("exp: r3", f[2]) );
     f = myLut.lookup([4,2,3]);
     request( bp.Event("exp: r3", f[2]) );
     request( bp.Event("exp: r3 (by name)", f.z ));
     f = myLut.lookup([4,2,4]);
     request( bp.Event("exp: r3", f[2]) );
     f = myLut.lookup([4,2,5]);
     request( bp.Event("exp: NOT_FOUND", f) );
     
     f = myLut.lookup([10,7,999]);
     request( bp.Event("exp: 450", f.z.targetValue + " " + f[2].targetValue) );
     
     f = myLut.lookup([10,"X","ping"]);
     request( bp.Event("exp: pong", f.y.targetValue + " " + f[1].targetValue) );

    let useCase = request(myLut.generateLutEvents());
    let expected = myLut.lookup(useCase.data.values);
    request( bp.Event("Expecting: " + expected.join(", ")));
    
});
